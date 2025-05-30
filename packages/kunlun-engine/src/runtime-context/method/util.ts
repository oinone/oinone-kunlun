import { RuntimeModelField } from '../../runtime-metadata';
import { RuntimeContext } from '../runtime-context';

export function seekFieldRuntimeContext(context: RuntimeContext, field: RuntimeModelField): RuntimeContext | undefined {
  const name = field.data;
  const index = field.__index;
  // TODO 暂没考虑多视图
  const childrenContext = context.field ? context.childrenContext[0]?.childrenContext : context.childrenContext;

  return childrenContext?.find((v) => !!v.field && v.field.data === name && v.field.__index === index);
}
