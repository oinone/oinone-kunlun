import { FieldDslDefinition } from '@oinone/kunlun-dsl';
import { RuntimeDateTimeField } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';

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
