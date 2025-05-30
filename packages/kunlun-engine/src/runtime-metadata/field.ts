import { EnumOptionState, ModelFieldType } from '@kunlun/meta';
import { RelationUpdateType, SubmitCacheManager } from '../submit';
import { RuntimeModel, RuntimeModelField } from './base';

/**
 * 引用字段
 */
export interface RuntimeRelatedField extends RuntimeModelField {
  /**
   * 引用业务类型
   */
  relatedTtype: ModelFieldType;
  /**
   * 引用属性
   */
  related: string[];
}

export interface RuntimeRelationField extends RuntimeModelField {
  /**
   * 是否关系存储
   */
  relationStore: boolean;
  /**
   * 关联模型编码
   */
  references: string;
  /**
   * 关联模型
   */
  referencesModel: RuntimeModel;
  /**
   * 关系字段（在当前模型中的字段）
   */
  relationFields: string[];
  /**
   * 关联字段（在关联模型中的字段）
   */
  referenceFields: string[];
  /**
   * 不可视过滤条件
   */
  filter?: string;
  /**
   * 可视过滤条件
   */
  domain?: string;
  /**
   * 关联关系更新类型
   */
  relationUpdateType?: RelationUpdateType;
  /**
   * 提交缓存
   */
  submitCache?: SubmitCacheManager;
  /**
   * 排序字段
   */
  sortFields?: string[];
}

export type RuntimeO2OField = RuntimeRelationField;

export interface RuntimeO2MField extends RuntimeRelationField {
  /**
   * 限制数量
   */
  limit?: number | string;
}

export type RuntimeM2OField = RuntimeRelationField;

export interface RuntimeM2MField extends RuntimeRelationField {
  /**
   * 多对多中间模型编码
   */
  through: string;
  /**
   * 多对多中间模型关系字段（与关系字段对应）
   */
  throughRelationFields: string[];
  /**
   * 多对多中间模型关联字段（与关联字段对应）
   */
  throughReferenceFields: string[];
  /**
   * 限制数量
   */
  limit?: string | number;
}

/**
 * 运行时搜索模型字段
 */
export interface RuntimeSearchField extends RuntimeModelField {
  operator?: string;
  allowSearch?: boolean;
}

export interface RuntimeStringField extends RuntimeModelField {
  size?: string | number;
  limit?: string | number;
  max?: string | number;
  min?: string | number;
}

export interface RuntimeNumberField extends RuntimeModelField {
  size?: string | number;
  decimal?: string | number;
  max?: string | number;
  min?: string | number;
  /**
   * 限制数量
   */
  limit?: string | number;
}

export interface RuntimeEnumerationOption {
  // region 基础属性
  name: string;
  value: string;
  label?: string;
  displayName?: string;
  hint?: string;
  invisible?: boolean | string;
  disabled?: boolean | string;
  isDefault?: boolean;
  state?: EnumOptionState;
  // endregion

  // region 外观属性
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  icon?: string;
  help?: string;
  // endregion

  // region 其他属性
  thumbnail?: string;
  // endregion
}

export interface RuntimeBooleanField extends RuntimeModelField {
  options: [RuntimeEnumerationOption, RuntimeEnumerationOption];
}

export interface RuntimeEnumerationField extends RuntimeModelField {
  options: RuntimeEnumerationOption[];
}

export interface RuntimeDateTimeField extends RuntimeModelField {
  format?: string;
  valueFormat: string;
  dateFormat?: string;
  timeFormat?: string;
}

export interface RuntimeDateField extends RuntimeModelField {
  format?: string;
  valueFormat: string;
  dateFormat?: string;
}

export interface RuntimeTimeField extends RuntimeModelField {
  format?: string;
  valueFormat: string;
  timeFormat?: string;
}

export interface RuntimeYearField extends RuntimeModelField {
  format?: string;
  valueFormat: string;
}
