import type { FieldDslDefinition } from '@oinone/kunlun-dsl';
import type { RuntimeYearField } from '../../../runtime-metadata';
import type { RuntimeContext } from '../../runtime-context';

export function convertYearField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition, field: RuntimeYearField) {
  field.format = dsl.format;
  field.valueFormat = dsl.valueFormat;
}
