import { type IdModel, type ListModelApi, QueryWrapper } from '@oinone/kunlun-engine';
import { type Converter, type OioListItem, Optional, type ReturnPromise } from '@oinone/kunlun-shared';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { computed, reactive, watch } from 'vue';
import { useListChecked } from './useListChecked';
import type { TreeInitOptions } from './useTreeState';

interface ListInitContext<T> {
  storage: Record<string, OioListItem<T>>;
  count: number;
  checkedKeys: string[];
  expandedKeys: string[];
  expandedAll: boolean;
}

export interface ListInitOptions {
  model: string;
  rsql: string;
  checkedKeys: string[];
}

export interface ListState<T> {
  mode: SelectMode;
  storage: Record<string, OioListItem<T>>;
  data: OioListItem<T>[];
  count: number;
  loading: boolean;
  checkedKeys: string[];
  checkedItems: OioListItem<T>[];

  lastCheckedKeys?: string[];
  lastCheckedItems?: OioListItem<T>[];
  submitCheckedKeys?: string[];
  submitCheckedItems?: OioListItem<T>[];
}

export interface ListStateProps {
  mode?: SelectMode | keyof typeof SelectMode;
  getCheckedKeys?: () => string[] | undefined;
  getSearchValue?: () => string | null | undefined;
}

export type ListStateLoadFunction<T extends IdModel> = (
  state: ListState<T>,
  service: ListModelApi<T>,
  queryWrapper: QueryWrapper
) => ReturnPromise<T[]>;

export function useListState<T extends IdModel>(initOptions: {
  service: ListModelApi<T>;
  props?: ListStateProps;
  initState?: Converter<ListState<T>, ListState<T>>;
  load?: ListStateLoadFunction<T>;
  convertListData?: (list: T[]) => OioListItem<T>[];
  initListState?: (state: ListState<T>, options?: ListInitOptions) => void;
  searchListState?: (state: ListState<T>, options?: ListInitOptions) => void;
}) {
  const { service, props, initState, convertListData } = initOptions;

  const state: ListState<T> = reactive(
    Optional.ofNullable(initState)
      .map((fn) => fn(initDefaultState(props) as ListState<T>))
      .orElseGet(() => initDefaultState(props) as ListState<T>)
  ) as ListState<T>;

  const filterData = computed(() => {
    const searchValue = props?.getSearchValue?.();
    if (searchValue) {
      const filterList: OioListItem<T>[] = [];
      for (const item of state.data) {
        if (item.label.indexOf(searchValue) > -1) {
          filterList.push(item);
        }
      }
      return filterList;
    }
    return state.data;
  });

  const hasFilter = computed(() => {
    return !!props?.getSearchValue?.();
  });

  const checkedAll = computed(() => {
    if (hasFilter.value) {
      return $$isCheckedAll(filterData.value);
    }
    return state.checkedKeys.length >= 1 && state.checkedKeys.length >= state.count;
  });

  const $$isCheckedAll = (items: OioListItem[]): boolean => {
    for (const item of items) {
      if (!item.checked) {
        return false;
      }
    }
    return true;
  };

  const halfCheckedAll = computed(() => {
    if (hasFilter.value) {
      return $$hasAnyChecked(filterData.value) && !checkedAll.value;
    }
    return state.checkedKeys.length >= 1 && state.checkedKeys.length < state.count;
  });

  const $$hasAnyChecked = (items: OioListItem[]): boolean => {
    for (const item of items) {
      if (item.checked) {
        return true;
      }
    }
    return false;
  };

  const { onChecked, $$updateChecked, onCheckedAll, onRefreshCheckedState } = useListChecked(state, {
    isDiff: () => hasFilter.value
  });

  const init = async (options?: Partial<ListInitOptions>): Promise<ListState<T>> => {
    state.data = await $$load(options);
    initListState($$initOptions(options));
    return state;
  };

  const $$load = async (options?: Partial<ListInitOptions>): Promise<OioListItem<T>[]> => {
    const queryWrapper: QueryWrapper = {};
    if (options?.model) {
      queryWrapper.model = options.model;
    }
    if (options?.rsql) {
      queryWrapper.rsql = options.rsql;
    }
    let list: T[];
    if (initOptions.load) {
      list = await initOptions.load(state, service, queryWrapper);
    } else {
      list = (await service.queryPage({ currentPage: 1, size: -1 }, queryWrapper)).content;
    }
    if (convertListData) {
      return convertListData(list);
    }
    return service.convertListData(list);
  };

  const $$initOptions = (options?: Partial<ListInitOptions>): ListInitOptions => {
    return {
      model: options?.model || '',
      rsql: options?.rsql || '',
      checkedKeys: options?.checkedKeys || []
    };
  };

  const initListState = (options: ListInitOptions, isSearch?: boolean) => {
    const context: ListInitContext<T> = {
      storage: {},
      count: 0,
      checkedKeys: options.checkedKeys,
      expandedKeys: [],
      expandedAll: state.data.length <= 100
    };
    if (isSearch) {
      state.lastCheckedKeys = state.checkedKeys;
      state.lastCheckedItems = state.checkedItems;
    } else {
      state.lastCheckedKeys = [];
      state.lastCheckedItems = [];
    }
    state.submitCheckedKeys = undefined;
    state.submitCheckedItems = undefined;
    state.checkedKeys = [];
    state.checkedItems = [];
    $$initListState(context, state.data);
    state.count = context.count;
    state.storage = context.storage;
  };

  const $$initListState = (context: ListInitContext<T>, items: OioListItem<T>[]) => {
    for (const item of items) {
      const { key } = item;
      if (context.checkedKeys.indexOf(key) > -1) {
        $$updateChecked(state, item, true);
      }
      context.count++;
      context.storage[key] = item;
    }
  };

  const search = async (options?: Partial<TreeInitOptions>) => {
    state.data = await $$load(options);
    if (initOptions.searchListState) {
      initOptions.searchListState(state, $$initOptions(options));
    } else {
      initListState($$initOptions(options), true);
    }
    return state;
  };

  const getCheckedKeys = props?.getCheckedKeys;
  if (getCheckedKeys) {
    watch(getCheckedKeys, (val: string[] | undefined) => {
      if (state.checkedKeys === val) {
        return;
      }
      onRefreshCheckedState(state.data, val || []);
      state.data = [...state.data];
    });
  }

  return {
    state,
    filterData,
    checkedAll,
    halfCheckedAll,
    init,
    search,
    onChecked,
    onCheckedAll
  };
}

function initDefaultState(options?: { mode?: SelectMode | keyof typeof SelectMode }) {
  return {
    mode: (options?.mode as SelectMode) || SelectMode.multiple,
    storage: {},
    data: [],
    count: 0,
    loading: false,
    checkedKeys: [],
    checkedItems: []
  };
}
