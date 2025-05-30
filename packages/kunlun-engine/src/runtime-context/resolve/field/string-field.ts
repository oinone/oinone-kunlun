import { FieldDslDefinition } from '@kunlun/dsl';
import { RuntimeStringField } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';
import { ResolveUtil } from '../util';

export function convertStringField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition, field: RuntimeStringField) {
  const { size, limit, min, max } = dsl;
  field.size = ResolveUtil.toNumberNullable(size);
  field.limit = ResolveUtil.toNumberNullable(limit);
  field.min = ResolveUtil.toNumberNullable(min);
  field.max = ResolveUtil.toNumberNullable(max);
}
