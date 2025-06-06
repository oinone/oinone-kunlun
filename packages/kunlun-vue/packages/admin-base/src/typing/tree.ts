import { ActiveRecord, Pagination, RefreshCallChainingParameters } from '@oinone/kunlun-engine';
import { TreeNode } from '@oinone/kunlun-shared';
import { Slot } from 'vue';

export type SimpleTreeModelField = {
  model?: string;
  fieldName: string;
};

/**
 * 树节点元数据
 */
export interface TreeNodeMetadata {
  /**
   * 唯一键
   */
  key: string;
  /**
   * 标题
   */
  title?: string;
  /**
   * 模型编码
   */
  model: string;
  /**
   * 数据标题
   */
  label?: string;
  /**
   * 数据标题字段
   */
  labelFields?: string[];
  /**
   * 树搜索字段
   */
  searchFields?: string[];
  /**
   * 上级节点
   */
  parent?: TreeNodeMetadata;
  /**
   * 子节点
   */
  child?: TreeNodeMetadata;
  /**
   * 与上级节点之间的关系字段
   */
  references?: SimpleTreeModelField;
  /**
   * 自关联的关系字段
   */
  selfReferences?: SimpleTreeModelField;
  /**
   * 过滤条件
   */
  filter?: string;
  /**
   * 点击搜索字段
   */
  search?: SimpleTreeModelField;
  /**
   * 行内按钮插槽
   */
  rowActionsSlot?: Slot;

  /**
   * 图标 iconfont/https
   */
  icon?: string;

  /**
   * 是否翻译label 默认为false
   */
  translate?: boolean;

  /**
   * 是否为自动展开层级的末端 默认为 undefined/false
   */
  expandEndLevel?: boolean;

  /**
   * 其他属性
   */
  [key: string]: unknown;
}

export interface TreeData {
  label?: string;
  metadata: TreeNodeMetadata;
  pagination?: Pagination;
  data?: ActiveRecord;
  isLeaf?: boolean;
}

export interface TreeRefreshCallChainingParameters extends RefreshCallChainingParameters {
  node?: TreeNode<TreeData>;
  isSkipRefreshSelf?: boolean;
}

export enum DropMode {
  DropCurrent = 'current',
  DropEarliest = 'earliest'
}
