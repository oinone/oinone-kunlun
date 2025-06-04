import { ModelFieldType } from '@oinone/kunlun-meta';

export const STRING_FIELD_TTYPES = [
  ModelFieldType.String,
  ModelFieldType.Text,
  ModelFieldType.HTML,
  ModelFieldType.Phone,
  ModelFieldType.Email
];

export const NUMBER_FIELD_TTYPES = [
  ModelFieldType.Integer,
  ModelFieldType.Long,
  ModelFieldType.Float,
  ModelFieldType.Currency
];

export const DATETIME_FIELD_TTYPES = [
  ModelFieldType.DateTime,
  ModelFieldType.Date,
  ModelFieldType.Time,
  ModelFieldType.Year
];

export const RELATION_2O_FIELD_TTYPES = [ModelFieldType.OneToOne, ModelFieldType.ManyToOne];

export const RELATION_2M_FIELD_TTYPES = [ModelFieldType.OneToMany, ModelFieldType.ManyToMany];

export const RELATION_FIELD_TTYPES = [...RELATION_2O_FIELD_TTYPES, ...RELATION_2M_FIELD_TTYPES];

export const RELATION_FIELD_STATIC_FLAG = '#';
