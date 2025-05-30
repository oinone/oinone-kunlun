import { ActionType, ModelFieldType, ViewType } from '@kunlun/meta';

/**
 * 默认模板插槽名称
 */
export const DEFAULT_SLOT_NAME = 'default';

/**
 * 内置dsl定义类型
 */
export enum DslDefinitionType {
  UNKNOWN = 'unknown',
  VIEW = 'view',
  PACK = 'pack',
  ELEMENT = 'element',
  FIELD = 'field',
  ACTION = 'action',
  SLOT = 'slot',
  TEMPLATE = 'template'
}

export const UnknownDslDefinition = {
  dslNodeType: DslDefinitionType.UNKNOWN,
  widgets: []
} as DslDefinition;

/**
 * <h3>dsl定义</h3>
 * <p>
 * PS: 所有未定义属性均为string或boolean
 * </p>
 */
export interface DslDefinition extends Record<string, any> {
  /**
   * dsl节点类型，内置节点类型将根据不同规则查找组件，非内置节点类型将直接使用该值查找组件
   */
  dslNodeType: DslDefinitionType | string;
  /**
   * 子节点
   */
  widgets: DslDefinition[];
  /**
   * 是否隐藏，所有组件均可以控制是否隐藏
   */
  invisible?: boolean | string;
  /**
   * 唯一键，render时根据该键值判断是否进行节点更新，内置属性，不可修改
   */
  key?: string;
  /**
   * 当前dsl在父节点中的索引，内置属性，不可修改
   */
  __index?: number;
  /**
   * 元数据索引，当前节点为元数据相关节点时，将通过该索引进行精确定位字段元数据，内置属性，不可修改
   */
  __metadata_index?: number;
  /**
   * 标签文本内容
   */
  __content?: string;
}

/**
 * view dsl定义
 */
export interface ViewDslDefinition extends DslDefinition {
  type: ViewType;
  metadata?: ViewMetadataDslDefinition;
  widgets: TemplateDslDefinition[];
}

/**
 * view metadata dsl定义
 */
export interface ViewMetadataDslDefinition extends DslDefinition {
  model: {
    model: string;
    field: FieldDslDefinition[];
  }[];
}

/**
 * pack dsl定义
 */
export interface PackDslDefinition extends DslDefinition {
  widget: string;
}

/**
 * element dsl定义
 */
export interface ElementDslDefinition extends DslDefinition {
  widget: string;
}

/**
 * field dsl定义
 */
export interface FieldDslDefinition extends DslDefinition {
  model: string;
  data: string;
  ttype: ModelFieldType;
  name?: string;
  widget?: string;
}

/**
 * action dsl定义
 */
export interface ActionDslDefinition extends DslDefinition {
  model: string;
  name: string;
  actionType: ActionType;
}

/**
 * slot dsl 定义
 */
export interface SlotDslDefinition extends DslDefinition {
  name: string;
  slotSupport?: string;
}

/**
 * template dsl定义
 */
export interface TemplateDslDefinition extends DslDefinition {
  slot: string;
}

/**
 * dsl插槽
 */
export type DslSlots = { default?: TemplateDslDefinition } & Record<string, TemplateDslDefinition | undefined>;
