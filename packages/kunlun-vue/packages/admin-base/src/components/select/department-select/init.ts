import { PamirsDepartment, PamirsDepartmentToken } from '@oinone/kunlun-engine';
import { OioTreeNode } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { reactive } from 'vue';
import { useTreeChecked } from '../../quick-utils';
import { useCheckedAll } from '../../quick-utils/checked-all';

interface InitContext {
  storage: Record<string, OioTreeNode<PamirsDepartment>>;
  count: number;
  checkedKeys: string[];
  checkedNodes: OioTreeNode<PamirsDepartment>[];
  expandedKeys: string[];
  expandedAll: boolean;
}

export interface DepartmentTreeInitOptions {
  checkedKeys: string[];
}

export interface DepartmentTreeState {
  mode: SelectMode;
  storage: Record<string, OioTreeNode<PamirsDepartment>>;
  data: OioTreeNode<PamirsDepartment>[];
  count: number;
  checkedAll: boolean;
  halfCheckedAll: boolean;
  checkedKeys: string[];
  expandedKeys: string[];
}

export interface DepartmentTreeInstance {
  init(options?: Partial<DepartmentTreeInitOptions>): Promise<DepartmentTreeState>;
}

export function useDepartmentTree(options?: { mode?: SelectMode | keyof typeof SelectMode }) {
  const state: DepartmentTreeState = reactive({
    mode: (options?.mode as SelectMode) || SelectMode.multiple,
    storage: {},
    data: [],
    count: 0,
    checkedAll: false,
    halfCheckedAll: false,
    checkedKeys: [],
    expandedKeys: []
  });

  const treeCheckedMethods = useTreeChecked(state);
  const { updateCheckedAllState } = useCheckedAll(state);

  const { onCheckedStrictly } = treeCheckedMethods;

  const onUpdateExpandedKeys = (keys: string[]) => {
    state.expandedKeys = keys;
  };

  const init = async (options?: Partial<DepartmentTreeInitOptions>) => {
    const departmentService = SPI.RawInstantiate(PamirsDepartmentToken)!;
    const departments = await departmentService.queryListByWrapper({});
    state.data = departmentService.convertTreeData(departments);
    initTreeState(initOptions(options));
    return state;
  };

  const initOptions = (options?: Partial<DepartmentTreeInitOptions>): DepartmentTreeInitOptions => {
    return {
      checkedKeys: options?.checkedKeys || []
    };
  };

  const initTreeState = (options: DepartmentTreeInitOptions) => {
    const context: InitContext = {
      storage: {},
      count: 0,
      checkedKeys: options.checkedKeys,
      checkedNodes: [],
      expandedKeys: [],
      expandedAll: state.data.length <= 100
    };
    state.checkedKeys = [];
    $$initTreeState(context, state.data);
    state.count = context.count;
    state.storage = context.storage;
    state.expandedKeys = context.expandedKeys;
    updateCheckedAllState();
  };

  const $$initTreeState = (context: InitContext, nodes: OioTreeNode<PamirsDepartment>[]) => {
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

  return {
    state,
    init,
    onUpdateExpandedKeys,
    updateCheckedAllState,
    ...treeCheckedMethods
  };
}
