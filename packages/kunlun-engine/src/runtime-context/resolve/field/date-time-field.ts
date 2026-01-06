import type { FieldDslDefinition } from '@oinone/kunlun-dsl';
import type { RuntimeDateTimeField } from '../../../runtime-metadata';
import type { RuntimeContext } from '../../runtime-context';

export function convertDateTimeField(
  runtimeContext: RuntimeContext,
  dsl: FieldDslDefinition,
  field: RuntimeDateTimeField
) {
  field.format = dsl.format;
  field.valueFormat = dsl.valueFormat;
  field.dateFormat = dsl.dateFormat;
  field.timeFormat = dsl.timeFormat;
}
