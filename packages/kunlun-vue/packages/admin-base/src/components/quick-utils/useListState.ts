import { IdModel, ListModelApi, PamirsEmployee, QueryWrapper } from '@oinone/kunlun-engine';
import { Converter, OioListItem, Optional } from '@oinone/kunlun-shared';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { computed, reactive } from 'vue';
import { useListChecked } from './list-checked';

interface ListInitContext<T> {
  storage: Record<string, OioListItem<T>>;
  count: number;
  checkedKeys: string[];
  expandedKeys: string[];
  expandedAll: boolean;
}

export interface ListInitOptions {
  rsql: string;
  checkedKeys: string[];
}

export interface ListState<T> {
  mode: SelectMode;
  storage: Record<string, OioListItem<T>>;
  data: OioListItem<T>[];
  count: number;
  checkedKeys: string[];
}

export interface ListStateProps {
  mode?: SelectMode | keyof typeof SelectMode;
  getSearchValue?: () => string | null | undefined;
}

export function useListState<T extends IdModel>(initOptions: {
  service: ListModelApi<T>;
  props?: ListStateProps;
  initState?: Converter<ListState<T>, ListState<T>>;
  convertListData?: (list: T[]) => OioListItem<T>[];
  initListState?: (state: ListState<T>, options?: ListInitOptions) => void;
}) {
  const { service, props, initState, convertListData } = initOptions;

  const queryListByWrapper = async (rsql?: string): Promise<T[]> => {
    const queryWrapper: QueryWrapper = {};
    if (rsql) {
      queryWrapper.rsql = rsql;
    }
    return service.queryListByWrapper(queryWrapper);
  };

  const state: ListState<T> = reactive(
    Optional.ofNullable(initState)
      .map((fn) => fn(initDefaultState(props) as ListState<T>))
      .orElseGet(() => initDefaultState(props) as ListState<T>)
  ) as ListState<T>;

  const filterData = computed(() => {
    const searchValue = props?.getSearchValue?.();
    if (searchValue) {
      const filterList: OioListItem<PamirsEmployee>[] = [];
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

  const listCheckedMethods = useListChecked(state, { hasFilter: () => hasFilter.value });
  const { onChecked } = listCheckedMethods;

  const init = async (options?: Partial<ListInitOptions>): Promise<ListState<T>> => {
    const list = await queryListByWrapper(options?.rsql);
    if (convertListData) {
      state.data = convertListData(list);
    } else {
      state.data = service.convertListData(list);
    }
    initListState($$initOptions(options));
    return state;
  };

  const $$initOptions = (options?: Partial<ListInitOptions>): ListInitOptions => {
    return {
      rsql: options?.rsql || '',
      checkedKeys: options?.checkedKeys || []
    };
  };

  const initListState = (options: ListInitOptions) => {
    const context: ListInitContext<T> = {
      storage: {},
      count: 0,
      checkedKeys: options.checkedKeys,
      expandedKeys: [],
      expandedAll: state.data.length <= 100
    };
    state.checkedKeys = [];
    $$initListState(context, state.data);
    state.count = context.count;
    state.storage = context.storage;
  };

  const $$initListState = (context: ListInitContext<T>, items: OioListItem<T>[]) => {
    for (const item of items) {
      const { key } = item;
      if (context.checkedKeys.indexOf(key) > -1) {
        onChecked(item, true);
      }
      context.count++;
      context.storage[key] = item;
    }
  };

  return {
    state,
    filterData,
    checkedAll,
    halfCheckedAll,
    init,
    ...listCheckedMethods
  };
}

function initDefaultState(options?: { mode?: SelectMode | keyof typeof SelectMode }) {
  return {
    mode: (options?.mode as SelectMode) || SelectMode.multiple,
    storage: {},
    data: [],
    count: 0,
    checkedKeys: []
  };
}
