import { isValidateEmpty, ModelFieldType } from '@oinone/kunlun-meta';
import type { RuntimeBooleanField, RuntimeDateField, RuntimeDateTimeField, RuntimeEnumerationField, RuntimeM2MField, RuntimeM2OField, RuntimeModelField, RuntimeNumberField, RuntimeO2MField, RuntimeO2OField, RuntimeRelatedField, RuntimeRelationField, RuntimeStringField, RuntimeTimeField, RuntimeYearField } from '../../runtime-metadata';
import { NUMBER_FIELD_TTYPES, RELATION_2M_FIELD_TTYPES, RELATION_2O_FIELD_TTYPES, RELATION_FIELD_STATIC_FLAG, RELATION_FIELD_TTYPES, STRING_FIELD_TTYPES } from './field-constant';

export function isRelatedField(field: RuntimeModelField): field is RuntimeRelatedField {
  return field.ttype === ModelFieldType.Related;
}

export function getRealTtype(field: RuntimeModelField): ModelFieldType {
  let finalTtype = field.ttype;
  if (isRelatedField(field)) {
    finalTtype = field.relatedTtype;
  }
  return finalTtype;
}

export function isRelationField(field: RuntimeModelField): field is RuntimeRelationField {
  return RELATION_FIELD_TTYPES.includes(getRealTtype(field));
}

export function isRelation2OField(field: RuntimeModelField): field is RuntimeO2OField | RuntimeM2OField {
  return RELATION_2O_FIELD_TTYPES.includes(getRealTtype(field));
}

/**
 * 判断字段值是否应按「空」处理（供必填校验使用）。
 *
 * - 非 M2O/O2O（含 Related 且真实 ttype 非 2O）：直接委托 `isValidateEmpty`，不改变原有语义。
 * - M2O/O2O：在 `isValidateEmpty` 之外，若值为对象但关联主键全部为空，也视为空。
 *   典型场景：新增行 `getDefaultValue` 曾写入无主键的关联 default 对象，Select 未选中但
 *   `isValidateEmpty` 为 false，导致必填漏检、单元格不出红框。
 *
 * 说明：本函数不改全局 `isValidateEmpty`；多值列表（O2M/M2M）不在此按主键展开。
 * 误传非空数组时：已由 `isValidateEmpty` 处理空数组；非空数组不视为「无主键空对象」。
 *
 * @param field 运行时字段元数据（用于识别 2O 与 referencesModel.pks）
 * @param value 待校验的字段值
 * @returns true 表示应按必填失败处理
 */
export function isRelation2OValueEmpty(field: RuntimeModelField, value: unknown): boolean {
  // 非 2O：保持与 isValidateEmpty 完全一致
  if (!isRelation2OField(field)) {
    return isValidateEmpty(value);
  }
  // 通用空（null / undefined / '' / {} / []）
  if (isValidateEmpty(value)) {
    return true;
  }
  // 仅处理单对象 2O；标量 / 数组不按「无主键假对象」判空
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  // 关联主键：优先 referencesModel.pks，缺省按 id
  const pks =
    field.referencesModel?.pks?.length ? field.referencesModel.pks : ['id'];
  return pks.every((pk) => isValidateEmpty((value as Record<string, unknown>)[pk]));
}

export function isRelation2MField(field: RuntimeModelField): field is RuntimeO2MField | RuntimeM2MField {
  return RELATION_2M_FIELD_TTYPES.includes(getRealTtype(field));
}

export function isStaticRelationField(s: string): boolean {
  return s.startsWith(RELATION_FIELD_STATIC_FLAG) && s.endsWith(RELATION_FIELD_STATIC_FLAG);
}

export function getStaticRelationField(s: string): string {
  return s.substring(1, s.length - 1);
}

export function isO2OField(field: RuntimeModelField): field is RuntimeO2OField {
  return getRealTtype(field) === ModelFieldType.OneToOne;
}

export function isM2OField(field: RuntimeModelField): field is RuntimeM2OField {
  return getRealTtype(field) === ModelFieldType.ManyToOne;
}

export function isO2MField(field: RuntimeModelField): field is RuntimeO2MField {
  return getRealTtype(field) === ModelFieldType.OneToMany;
}

export function isM2MField(field: RuntimeModelField): field is RuntimeM2MField {
  return getRealTtype(field) === ModelFieldType.ManyToMany;
}

export function isStringField(field: RuntimeModelField): field is RuntimeStringField {
  return STRING_FIELD_TTYPES.includes(getRealTtype(field));
}

export function isNumberField(field: RuntimeModelField): field is RuntimeNumberField {
  return NUMBER_FIELD_TTYPES.includes(getRealTtype(field));
}

export function isBooleanField(field: RuntimeModelField): field is RuntimeBooleanField {
  return getRealTtype(field) === ModelFieldType.Boolean;
}

export function isEnumerationField(field: RuntimeModelField): field is RuntimeEnumerationField {
  return getRealTtype(field) === ModelFieldType.Enum;
}

export function isDateTimeField(field: RuntimeModelField): field is RuntimeDateTimeField {
  return getRealTtype(field) === ModelFieldType.DateTime;
}

export function isDateField(field: RuntimeModelField): field is RuntimeDateField {
  return getRealTtype(field) === ModelFieldType.Date;
}

export function isTimeField(field: RuntimeModelField): field is RuntimeTimeField {
  return getRealTtype(field) === ModelFieldType.Time;
}

export function isYearField(field: RuntimeModelField): field is RuntimeYearField {
  return getRealTtype(field) === ModelFieldType.Year;
}
