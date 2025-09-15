import { CSSStyle } from '../style';
import { StandardTreeNode } from '../tree-node';

/**
 * 通用树节点数据结构
 */
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
   * 是否被选中
   */
  checked?: boolean;
  /**
   * 半选状态
   */
  halfChecked?: boolean;
  /**
   * 是否可选择, 默认: true
   */
  selectable?: boolean;
  /**
   * 是否禁用
   */
  disabled?: boolean;
}
