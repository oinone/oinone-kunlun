import { OioEvent } from '../../event';
import { OioTreeNode } from './props';

/**
 * 树节点选中事件
 */
export interface TreeNodeSelectedEvent<T = unknown> extends OioEvent {
  /**
   * 原生事件
   */
  event: PointerEvent;
  /**
   * 选中节点
   */
  node: OioTreeNode<T>;
  /**
   * 是否选中（选中/取消选中）
   */
  selected: boolean;
  /**
   * 当前所有选中节点
   */
  selectedKeys: string[];
}

/**
 * 树节点展开事件
 */
export interface TreeNodeExpandedEvent<T = unknown> extends OioEvent {
  /**
   * 原生事件
   */
  event: PointerEvent;
  /**
   * 展开节点
   */
  node: OioTreeNode<T>;
  /**
   * 是否展开（展开/收起）
   */
  expanded: boolean;
  /**
   * 当前所有展开节点
   */
  expandedKeys: string[];
}

/**
 * 树节点选中事件
 */
export interface TreeNodeCheckedEvent<T = unknown> extends OioEvent {
  /**
   * 原生事件
   */
  event: PointerEvent;
  /**
   * 展开节点
   */
  node: OioTreeNode<T>;
  /**
   * 是否选中
   */
  checked: boolean;
  /**
   * 当前所有展开节点
   */
  checkedKeys: string[];
}
