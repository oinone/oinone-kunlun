import type { FieldDslDefinition } from '@oinone/kunlun-dsl';
import type { RuntimeDateField } from '../../../runtime-metadata';
import type { RuntimeContext } from '../../runtime-context';

export function convertDateField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition, field: RuntimeDateField) {
  field.format = dsl.format;
  field.valueFormat = dsl.valueFormat;
  field.dateFormat = dsl.dateFormat;
}
