import { CSSStyle, StandardTreeNode } from '@oinone/kunlun-shared';
import { PropType } from 'vue';
import { OioSpinProps } from '../oio-spin';

export interface OioTreeNode<T = unknown> extends StandardTreeNode<T, OioTreeNode<T>> {
  class?: string | string[];
  style?: CSSStyle;
  title?: string;
  value: T;

  /**
   * 正在加载更多状态
   */
  loadingMore?: boolean;
  /**
   * 预加载
   */
  preloaded?: boolean;
  /**
   * 已加载（不再查询子节点）
   */
  loaded?: boolean;
  /**
   * 正在加载状态
   */
  loading?: boolean;
  /**
   * 是否显示checkbox, 默认: true
   */
  checkbox?: boolean;
  /**
   * 是否可选择, 默认: true
   */
  selectable?: boolean;
  /**
   * 是否禁用
   */
  disabled?: boolean;
}

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
