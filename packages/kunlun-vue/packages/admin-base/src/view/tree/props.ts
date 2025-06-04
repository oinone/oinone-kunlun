import { OioTreeNode } from '@oinone/kunlun-vue-ui-common';
import { PropType } from 'vue';
import { TreeData } from '../../typing';

const DefaultTreeSearchProps = {
  enableSearch: {
    type: Boolean,
    default: false
  },
  searchPlaceHolder: {
    type: String,
    default: '请输入关键字'
  },
  searchRootNode: {
    type: Object as PropType<OioTreeNode<TreeData>>
  },
  searchValue: {
    type: String
  },
  onUpdateSearchValue: {
    type: Function as PropType<(val: string) => void>
  },
  onSearch: {
    type: Function as PropType<(val: string) => void>
  }
};

const DefaultTreeSelectProps = {
  selectable: {
    type: Boolean,
    default: undefined
  },
  selectedKeys: {
    type: Array as PropType<string[]>
  },
  onUpdateSelectedKeys: {
    type: Function as PropType<(val: string[]) => void>
  },
  onSelected: {
    type: Function as PropType<(node: OioTreeNode<TreeData>, selected: boolean) => Promise<void>>
  }
};

const DefaultTreeExpandProps = {
  expandedKeys: {
    type: Array as PropType<string[]>
  },
  onUpdateExpandedKeys: {
    type: Function as PropType<(val: string[]) => void>
  },
  onExpanded: {
    type: Function as PropType<(val: string[]) => void>
  }
};

const DefaultTreeCheckProps = {
  checkable: {
    type: Boolean,
    default: undefined
  },
  checkStrictly: {
    type: Boolean,
    default: undefined
  },
  checkedKeys: {
    type: Array as PropType<string[]>
  },
  onUpdateCheckedKeys: {
    type: Function as PropType<(val: string[]) => void>
  },
  halfCheckedKeys: {
    type: Array as PropType<string[]>
  },
  onUpdateHalfCheckedKeys: {
    type: Function as PropType<(val: string[]) => void>
  },
  onChecked: {
    type: Function as PropType<(node: OioTreeNode<TreeData>, checked: boolean) => Promise<void>>
  },
  checkAll: {
    type: Boolean,
    default: false
  },
  checkAllLabel: {
    type: String,
    default: '选择全部'
  },
  onCheckedAll: {
    type: Function as PropType<(checkedAll: boolean) => Promise<void>>
  },
  nodeCheckedAll: {
    type: [Boolean, Function] as PropType<boolean | ((node: OioTreeNode<TreeData>) => boolean)>,
    default: undefined
  },
  nodeCheckedAllLabel: {
    type: String,
    default: '全选'
  },
  nodeUncheckedAllLabel: {
    type: String,
    default: '反选'
  },
  onNodeCheckedAll: {
    type: Function as PropType<(node: OioTreeNode<TreeData>, selected: boolean) => Promise<void>>
  }
};

const DefaultTreeLoadProps = {
  rootNode: {
    type: Object as PropType<OioTreeNode<TreeData>>
  },
  loadData: {
    type: Function as PropType<(node: OioTreeNode<TreeData>) => Promise<void>>
  },
  loadMoreData: {
    type: Function as PropType<(node: OioTreeNode<TreeData>) => Promise<void>>
  },
  loadedKeys: {
    type: Array as PropType<string[]>
  },
  onUpdateLoadedKeys: {
    type: Function as PropType<(val: string[]) => void>
  }
};

export const DefaultTreeProps = {
  ...DefaultTreeSearchProps,
  ...DefaultTreeLoadProps,
  ...DefaultTreeSelectProps,
  ...DefaultTreeExpandProps,
  ...DefaultTreeCheckProps,
  invisible: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: undefined
  }
};
