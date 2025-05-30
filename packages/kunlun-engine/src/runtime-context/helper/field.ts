import { ModelFieldType } from '@kunlun/meta';
import {
  RuntimeBooleanField,
  RuntimeDateField,
  RuntimeDateTimeField,
  RuntimeEnumerationField,
  RuntimeM2MField,
  RuntimeM2OField,
  RuntimeModelField,
  RuntimeNumberField,
  RuntimeO2MField,
  RuntimeO2OField,
  RuntimeRelatedField,
  RuntimeRelationField,
  RuntimeStringField,
  RuntimeTimeField,
  RuntimeYearField
} from '../../runtime-metadata';
import {
  NUMBER_FIELD_TTYPES,
  RELATION_2M_FIELD_TTYPES,
  RELATION_2O_FIELD_TTYPES,
  RELATION_FIELD_STATIC_FLAG,
  RELATION_FIELD_TTYPES,
  STRING_FIELD_TTYPES
} from './field-constant';

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
