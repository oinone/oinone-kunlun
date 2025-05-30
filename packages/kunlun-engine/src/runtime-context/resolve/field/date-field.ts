import { FieldDslDefinition } from '@kunlun/dsl';
import { RuntimeDateField } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';

export function convertDateField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition, field: RuntimeDateField) {
  field.format = dsl.format;
  field.valueFormat = dsl.valueFormat;
  field.dateFormat = dsl.dateFormat;
}
