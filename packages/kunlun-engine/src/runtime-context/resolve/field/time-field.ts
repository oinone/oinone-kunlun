import { FieldDslDefinition } from '@kunlun/dsl';
import { RuntimeTimeField } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';

export function convertTimeField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition, field: RuntimeTimeField) {
  field.format = dsl.format;
  field.valueFormat = dsl.valueFormat;
  field.timeFormat = dsl.timeFormat;
}
