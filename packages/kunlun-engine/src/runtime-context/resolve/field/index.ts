import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { NUMBER_FIELD_TTYPES, RELATION_FIELD_TTYPES, STRING_FIELD_TTYPES } from '../../helper';
import { convertDateField } from './date-field';
import { convertDateTimeField } from './date-time-field';
import { convertEnumerationField } from './enumeration-field';
import { convertNumberField } from './number-field';
import { convertRelatedField } from './related-field';
import {
  convertM2MField,
  convertM2OField,
  convertO2MField,
  convertO2OField,
  convertRelationField
} from './relation-field';
import { resolveDefaultValue, resolveSearchDatetimeDefaultValue } from './resolve-default-value';
import { convertSearchField } from './search-field';
import { FieldConverterOptions, registerConverter } from './spi';
import { convertStringField } from './string-field';
import { convertTimeField } from './time-field';
import { convertYearField } from './year-field';

registerConverter({}, resolveDefaultValue);
registerConverter({ viewType: ViewType.Search }, convertSearchField);
registerConverter(
  {
    viewType: ViewType.Search,
    ttype: [ModelFieldType.DateTime, ModelFieldType.Date, ModelFieldType.Time, ModelFieldType.Year]
  },
  resolveSearchDatetimeDefaultValue
);
registerConverter({ ttype: ModelFieldType.Related }, convertRelatedField);
registerConverter({ ttype: STRING_FIELD_TTYPES }, convertStringField);
registerConverter({ ttype: NUMBER_FIELD_TTYPES }, convertNumberField);
registerConverter({ ttype: [ModelFieldType.Enum, ModelFieldType.Boolean] }, convertEnumerationField);
registerConverter({ ttype: ModelFieldType.DateTime }, convertDateTimeField);
registerConverter({ ttype: ModelFieldType.Date }, convertDateField);
registerConverter({ ttype: ModelFieldType.Time }, convertTimeField);
registerConverter({ ttype: ModelFieldType.Year }, convertYearField);
registerConverter({ ttype: RELATION_FIELD_TTYPES }, convertRelationField);
registerConverter({ ttype: ModelFieldType.OneToOne }, convertO2OField);
registerConverter({ ttype: ModelFieldType.ManyToOne }, convertM2OField);
registerConverter({ ttype: ModelFieldType.OneToMany }, convertO2MField);
registerConverter({ ttype: ModelFieldType.ManyToMany }, convertM2MField);

export { resolveField } from './resolve';
export { FieldConverterOptions, registerConverter as registerFieldConverter };
