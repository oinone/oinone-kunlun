import { OioTreeNode } from '@oinone/kunlun-shared';
import { PropType } from 'vue';
import { OioSpinProps } from '../oio-spin';

const OioTreeSelectProps = {
  selectable: {
    type: Boolean,
    default: undefined
  },
  selectedKeys: {
    type: Array as PropType<string[]>
  }
};

const OioTreeExpandProps = {
  expandedKeys: {
    type: Array as PropType<string[]>
  },
  /**
   * @deprecated please manual set expandedKeys
   */
  autoExpandParent: {
    type: Boolean,
    default: undefined
  }
};

const OioTreeCheckProps = {
  checkable: {
    type: Boolean,
    default: undefined
  },
  checkedKeys: {
    type: [Array, Object] as PropType<
      | string[]
      | {
          checked: string[];
          halfChecked: string[];
        }
    >
  },
  checkStrictly: {
    type: Boolean,
    default: undefined
  }
};

const OioTreeLoadProps = {
  data: {
    type: Array as PropType<OioTreeNode[]>
  },
  loadData: {
    type: Function as PropType<(node: OioTreeNode) => Promise<void>>
  },
  loadedKeys: {
    type: Array as PropType<string[]>
  }
};

export const OioTreeProps = {
  ...OioSpinProps,
  ...OioTreeLoadProps,
  ...OioTreeSelectProps,
  ...OioTreeExpandProps,
  ...OioTreeCheckProps,
  blockNode: {
    type: Boolean,
    default: undefined
  },
  showIcon: {
    type: Boolean,
    default: undefined
  },
  showLine: {
    type: Boolean,
    default: undefined
  }
};
