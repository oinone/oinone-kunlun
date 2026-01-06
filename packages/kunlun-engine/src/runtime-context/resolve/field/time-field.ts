import type { FieldDslDefinition } from '@oinone/kunlun-dsl';
import type { RuntimeTimeField } from '../../../runtime-metadata';
import type { RuntimeContext } from '../../runtime-context';

export function convertTimeField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition, field: RuntimeTimeField) {
  field.format = dsl.format;
  field.valueFormat = dsl.valueFormat;
  field.timeFormat = dsl.timeFormat;
}
