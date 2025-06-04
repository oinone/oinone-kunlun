import { FieldDslDefinition } from '@oinone/kunlun-dsl';
import { RuntimeYearField } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';

export function convertYearField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition, field: RuntimeYearField) {
  field.format = dsl.format;
  field.valueFormat = dsl.valueFormat;
}
