import { type IdModel, QueryWrapper, type TreeModelApi } from '@oinone/kunlun-engine';
import { type Converter, type OioTreeNode, Optional, type ReturnPromise, TreeHelper } from '@oinone/kunlun-shared';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { computed, reactive, watch } from 'vue';
import { useTreeChecked } from './useTreeChecked';

export interface TreeInitContext<T = unknown> {
  storage: Record<string, OioTreeNode<T>>;
  count: number;
  checkedKeys: string[];
  checkedNodes: OioTreeNode[];
  expandedKeys: string[];
  expandedAll: boolean;
}

export interface TreeInitOptions {
  model: string;
  rsql: string;
  checkedKeys: string[];
}

export interface TreeState<T = unknown> {
  mode: SelectMode;
  storage: Record<string, OioTreeNode<T>>;
  data: OioTreeNode<T>[];
  count: number;
  loading: boolean;
  checkedKeys: string[];
  checkedNodes: OioTreeNode<T>[];
  expandedKeys: string[];
  lastCheckedKeys: string[];
}

export interface TreeStateProps {
  mode?: SelectMode | keyof typeof SelectMode;
  getCheckedKeys?: () => string[] | undefined;
  getSearchValue?: () => string | null | undefined;
}

export type TreeStateLoadFunction<T extends IdModel> = (
  state: TreeState<T>,
  service: TreeModelApi<T>,
  queryWrapper: QueryWrapper
) => ReturnPromise<T[]>;

export function useTreeState<T extends IdModel>(initOptions: {
  service: TreeModelApi<T>;
  props?: TreeStateProps;
  initState?: Converter<TreeState<T>, TreeState<T>>;
  load?: TreeStateLoadFunction<T>;
  convertTreeData?: (list: T[]) => OioTreeNode<T>[];
  initTreeState?: (state: TreeState<T>, options: TreeInitOptions) => void;
  searchTreeState?: (state: TreeState<T>, options: TreeInitOptions) => void;
}) {
  const { service, props, initState, convertTreeData } = initOptions;

  const state: TreeState<T> = reactive(
    Optional.ofNullable(initState)
      .map((fn) => fn(initDefaultState(props) as TreeState<T>))
      .orElseGet(() => initDefaultState(props) as TreeState<T>)
  ) as TreeState<T>;

  const filterData = computed(() => {
    const searchValue = props?.getSearchValue?.();
    if (searchValue) {
      return TreeHelper.filter(state.data, (node) => {
        if (node.title) {
          return node.title.indexOf(searchValue) > -1;
        }
        return false;
      });
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

  const $$isCheckedAll = (nodes: OioTreeNode[]): boolean => {
    for (const node of nodes) {
      if (!node.checked) {
        return false;
      }
      if (!$$isCheckedAll(node.children)) {
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

  const $$hasAnyChecked = (nodes: OioTreeNode[]): boolean => {
    for (const node of nodes) {
      if (node.checked) {
        return true;
      }
      if ($$hasAnyChecked(node.children)) {
        return true;
      }
    }
    return false;
  };

  const { onChecked, onCheckedStrictly, $$checkedStrictly, onCheckedAll, onRefreshCheckedState } = useTreeChecked(
    state,
    {
      isDiff: () => hasFilter.value
    }
  );

  const onUpdateExpandedKeys = (keys: string[]) => {
    state.expandedKeys = keys;
  };

  const init = async (options?: Partial<TreeInitOptions>): Promise<TreeState<T>> => {
    state.data = await $$load(options);
    if (initOptions.initTreeState) {
      initOptions.initTreeState(state, $$initOptions(options));
    } else {
      initTreeState($$initOptions(options));
    }
    return state;
  };

  const $$load = async (options?: Partial<TreeInitOptions>): Promise<OioTreeNode<T>[]> => {
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
      list = await service.queryListByWrapper(queryWrapper);
    }
    if (convertTreeData) {
      return convertTreeData(list);
    }
    return service.convertTreeData(list);
  };

  const $$initOptions = (options?: Partial<TreeInitOptions>): TreeInitOptions => {
    return {
      model: options?.model || '',
      rsql: options?.rsql || '',
      checkedKeys: options?.checkedKeys || []
    };
  };

  const initTreeState = (options: TreeInitOptions, isSearch?: boolean) => {
    const context: TreeInitContext<T> = {
      storage: {},
      count: 0,
      checkedKeys: options.checkedKeys,
      checkedNodes: [],
      expandedKeys: [],
      expandedAll: state.data.length <= 100
    };
    if (isSearch) {
      state.lastCheckedKeys = state.checkedKeys;
    } else {
      state.lastCheckedKeys = [];
    }
    state.checkedKeys = [];
    state.checkedNodes = [];
    $$initTreeState(context, state.data);
    state.count = context.count;
    state.storage = context.storage;
    state.expandedKeys = context.expandedKeys;
  };

  const $$initTreeState = (context: TreeInitContext, nodes: OioTreeNode[]) => {
    for (const node of nodes) {
      const { key, children } = node;
      if (context.checkedKeys.indexOf(key) > -1) {
        $$checkedStrictly(node, true);
      }
      context.count++;
      context.storage[key] = node;
      if (children.length >= 1) {
        if (context.expandedAll) {
          context.expandedKeys.push(key);
        }
        $$initTreeState(context, children);
      }
    }
  };

  const search = async (options?: Partial<TreeInitOptions>) => {
    state.data = await $$load(options);
    if (initOptions.searchTreeState) {
      initOptions.searchTreeState(state, $$initOptions(options));
    } else {
      initTreeState($$initOptions(options), true);
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
    onUpdateExpandedKeys,
    onChecked,
    onCheckedStrictly,
    onCheckedAll
  };
}

function initDefaultState(props?: { mode?: SelectMode | keyof typeof SelectMode }): TreeState {
  return {
    mode: (props?.mode as SelectMode) || SelectMode.multiple,
    storage: {},
    data: [],
    count: 0,
    loading: false,
    checkedKeys: [],
    checkedNodes: [],
    expandedKeys: [],
    lastCheckedKeys: []
  };
}
