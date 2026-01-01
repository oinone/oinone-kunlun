import type { CSSStyle } from '../style';

/**
 * 标准树节点
 */
export interface StandardTreeNode<T, SELF extends StandardTreeNode<T, SELF>> {
  /**
   * 唯一键
   */
  key: string;
  /**
   * 值
   */
  value?: T;
  /**
   * 上级节点
   */
  parent?: SELF;
  /**
   * 子节点列表
   */
  children: SELF[];
  /**
   * 是否叶节点
   */
  isLeaf: boolean;
  /**
   * 节点所在层级
   */
  level?: number;

  /**
   * <h3>设置父节点</h3>
   * <p>
   * 设置父节点时，根据当前树的构建需要进行实现
   * </p>
   * <p>
   * 默认设置父节点方法请直接使用{@link TreeNode#setParent}方法
   * </p>
   * @param value
   * @param position
   */
  setParent?(value: SELF | undefined, position?: number): void;
}

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
