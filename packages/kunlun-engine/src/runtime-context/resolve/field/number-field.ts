import { FieldDslDefinition } from '@oinone/kunlun-dsl';
import { RuntimeNumberField } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';
import { ResolveUtil } from '../util';

export function convertNumberField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition, field: RuntimeNumberField) {
  const { size, decimal, max, min, limit } = dsl;
  field.size = ResolveUtil.toNumberOrStringNullable(size);
  field.decimal = ResolveUtil.toNumberOrStringNullable(decimal);
  field.max = ResolveUtil.toNumberOrStringNullable(max);
  field.min = ResolveUtil.toNumberOrStringNullable(min);
  field.limit = ResolveUtil.toNumberOrStringNullable(limit);
}
