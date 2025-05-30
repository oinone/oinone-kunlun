import { InternalMatchKey } from './match-key';
import { MatchArrayValue, MatchSingleValue } from './options';

/**
 * 节点
 */
interface Node<V> {
  /**
   * 匹配键
   */
  matchKey: InternalMatchKey;
  /**
   * 是否多值节点
   */
  multi: boolean;
  /**
   * 值
   */
  value?: V;
  /**
   * 父节点
   */
  parent?: NodeType<V>;
  /**
   * 子节点
   */
  children: NodeType<V>[];

  /**
   * <h3>层级</h3>
   * <p>
   * 当前节点在树中的层级
   * </p>
   */
  level: number;
  /**
   * 序列（在树中唯一，最小为0）
   */
  index: number;
  /**
   * 优先级
   */
  priority?: number;
}

/**
 * 单值节点
 */
export interface SingleValueNode<V> extends Node<V> {
  /**
   * 单个匹配值
   */
  matchValue: MatchSingleValue;
}

/**
 * 多值节点
 */
export interface MultiValueNode<V> extends Node<V> {
  /**
   * 多个匹配值
   */
  matchValues: MatchArrayValue[];
}

/**
 * 节点类型
 */
export type NodeType<V> = SingleValueNode<V> | MultiValueNode<V>;

/**
 * 匹配节点
 */
export interface MatchNode<V> {
  /**
   * 节点
   */
  node: NodeType<V>;

  /**
   * <h3>匹配权重</h3>
   * <p>
   * 在当前节点权重的基础上，根据匹配方式计算的最终权重
   * </p>
   */
  weight: number;
  /**
   * 匹配数量
   */
  matchCount: number;
}

/**
 * 是否为多值节点
 * @param node 节点
 */
export function isMultiValueNode<V>(node: NodeType<V>): node is MultiValueNode<V> {
  return node.multi;
}
