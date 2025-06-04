import { ActionDslDefinition, FieldDslDefinition } from '@oinone/kunlun-dsl';
import {
  ActionContextType,
  ActionType,
  ModelFieldSerializeType,
  ModelFieldType,
  ModelType,
  ViewType
} from '@oinone/kunlun-meta';
import { SubmitType } from '../submit';

/**
 * 运行时模块
 */
export interface RuntimeModule {
  /**
   * 模块编码
   */
  module?: string;
  /**
   * 模块名称
   */
  name: string;
  /**
   * 模块显示名称
   */
  displayName?: string;
}

/**
 * 运行时模型
 */
export interface RuntimeModel {
  /**
   * 模型id
   */
  id?: string;
  /**
   * 模型编码
   */
  model: string;
  /**
   * 技术名称
   */
  name: string;

  /**
   * 模型字段
   */
  modelFields: RuntimeModelField[];
  /**
   * 模型动作
   */
  modelActions: RuntimeAction[];

  /**
   * 模型类型
   */
  type?: ModelType;
  /**
   * 模块编码
   */
  module?: string;
  /**
   * 模块名称
   */
  moduleName: string;
  /**
   * 模块定义
   */
  moduleDefinition?: RuntimeModule;
  /**
   * 主键
   */
  pks?: string[];
  /**
   * 唯一键
   */
  uniques?: string[][];
  /**
   * 索引
   */
  indexes?: string[][];
  /**
   * 排序
   */
  sorting?: string;

  /**
   * 显示标题
   */
  label?: string;
  /**
   * 标题字段
   */
  labelFields?: string[];
}

/**
 * <h3>运行时模型元数据</h3>
 * <p>允许重复定义，必须根据索引进行查找</p>
 */
export interface BaseRuntimeModelMetadata {
  /**
   * 元数据id
   */
  id?: string;
  /**
   * 模型编码
   */
  model: string;
  /**
   * 模型名称
   */
  modelName: string;
  /**
   * 模型定义
   */
  modelDefinition?: RuntimeModel;
  /**
   * 元数据索引，与dsl中的__metadata_index匹配
   */
  __index?: number;
}

export function generatorModelName(model: string): string | undefined {
  const names = model.split('.');
  const modelName = names[names.length - 1];
  if (modelName.length === 1) {
    return modelName.toLowerCase();
  }
  if (modelName.length >= 2) {
    return `${modelName.substring(0, 1)?.toLowerCase()}${modelName.substring(1)}`;
  }
}

/**
 * 运行时模型字段
 */
export interface RuntimeModelField extends BaseRuntimeModelMetadata {
  /**
   * 原始dsl
   */
  template?: FieldDslDefinition;
  /**
   * 属性名称
   */
  data: string;
  /**
   * API名称
   */
  name: string;

  /**
   * 字段业务类型
   */
  ttype: ModelFieldType;
  /**
   * 是否多值
   */
  multi?: boolean;
  /**
   * 默认值
   * （经过解析后，可直接使用；当ttype为string时一定会是string | undefined；multi为true时一定会是string[] | undefined）
   */
  defaultValue?: unknown;

  /**
   * 是否存储
   */
  store: boolean;

  /**
   * 是否排序
   */
  sortable?: boolean;

  /**
   * 存储序列化方式
   */
  storeSerialize?: ModelFieldSerializeType;

  /**
   * 字段显示名称
   */
  displayName?: string;
  /**
   * 字段页面显示名称（优先于displayName）
   */
  label?: string;

  /**
   * 必填规则
   */
  required?: boolean | string;
  /**
   * 只读规则
   */
  readonly?: boolean | string;
  /**
   * 隐藏规则
   */
  invisible?: boolean | string;
  /**
   * 禁用规则
   */
  disabled?: boolean | string;

  /**
   * 计算表达式
   */
  compute?: string;

  /**
   * 提交类型
   */
  submitType?: SubmitType;

  /**
   * 是否为虚拟字段
   */
  isVirtual?: boolean;

  /**
   * 是否需要翻译
   */
  translate?: boolean;
}

/**
 * 运行时动作
 */
export interface RuntimeAction extends BaseRuntimeModelMetadata {
  /**
   * 原始dsl
   */
  template?: ActionDslDefinition;
  /**
   * 动作名称
   */
  name: string;
  /**
   * 动作组件
   */
  widget?: string;

  /**
   * 动作类型
   */
  actionType: ActionType;
  /**
   * 动作上下文类型（用于控制数据提交方式）
   */
  contextType: ActionContextType;

  /**
   * 绑定视图类型（表示该按钮仅在对应视图类型中显示）
   */
  bindingType?: ViewType[];
  /**
   * 绑定视图名称（表示该按钮仅在指定名称的视图中显示）
   */
  bindingViewName?: string;
  /**
   * 优先级
   */
  priority?: number;
  /**
   * 隐藏规则
   */
  invisible?: boolean | string;
  /**
   * 禁用规则
   */
  disabled?: boolean | string;

  /**
   * 字段显示名称
   */
  displayName?: string;
  /**
   * 动作页面显示名称（优先于displayName）
   */
  label?: string;
  /**
   * 数据映射
   */
  mapping?: Record<string, unknown>;
  /**
   * 上下文
   */
  context?: Record<string, unknown>;

  /**
   * 会话路径
   */
  sessionPath?: string;
}
