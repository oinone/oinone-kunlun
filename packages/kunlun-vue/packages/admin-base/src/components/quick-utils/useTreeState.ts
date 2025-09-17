import { IdModel, TreeModelApi } from '@oinone/kunlun-engine';
import { Converter, OioTreeNode, Optional, TreeHelper } from '@oinone/kunlun-shared';
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
}

export interface TreeStateProps {
  mode?: SelectMode | keyof typeof SelectMode;
  getCheckedKeys?: () => string[] | undefined;
  getSearchValue?: () => string | null | undefined;
}

export function useTreeState<T extends IdModel>(initOptions: {
  service: TreeModelApi<T>;
  props?: TreeStateProps;
  initState?: Converter<TreeState<T>, TreeState<T>>;
  convertTreeData?: (list: T[]) => OioTreeNode<T>[];
  initTreeState?: (state: TreeState<T>, options: TreeInitOptions) => void;
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

  const { onChecked, onCheckedStrictly, onCheckedAll, onRefreshCheckedState } = useTreeChecked(state, {
    hasFilter: () => hasFilter.value
  });

  const onUpdateExpandedKeys = (keys: string[]) => {
    state.expandedKeys = keys;
  };

  const init = async (options?: Partial<TreeInitOptions>) => {
    const list = await service.queryListByWrapper({});
    if (convertTreeData) {
      state.data = convertTreeData(list);
    } else {
      state.data = service.convertTreeData(list);
    }
    if (initOptions.initTreeState) {
      initOptions.initTreeState(state, $$initOptions(options));
    } else {
      initTreeState($$initOptions(options));
    }
    return state;
  };

  const $$initOptions = (options?: Partial<TreeInitOptions>): TreeInitOptions => {
    return {
      rsql: options?.rsql || '',
      checkedKeys: options?.checkedKeys || []
    };
  };

  const initTreeState = (options: TreeInitOptions) => {
    const context: TreeInitContext<T> = {
      storage: {},
      count: 0,
      checkedKeys: options.checkedKeys,
      checkedNodes: [],
      expandedKeys: [],
      expandedAll: state.data.length <= 100
    };
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
        onCheckedStrictly(node, true);
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
    expandedKeys: []
  };
}
