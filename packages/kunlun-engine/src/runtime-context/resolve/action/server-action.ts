import type { ActionDslDefinition } from '@oinone/kunlun-dsl';
import type { RuntimeServerAction } from '../../../runtime-metadata';
import type { RuntimeContext } from '../../runtime-context';
import { convertFunction, type DslFunction } from './resolve-function';

export function convertServerAction(
  runtimeContext: RuntimeContext,
  dsl: ActionDslDefinition,
  action: RuntimeServerAction
) {
  action.fun = dsl.fun;
  const dslFunction = dsl.function as DslFunction;
  if (dslFunction) {
    action.functionDefinition = convertFunction(action.model, dslFunction);
  }
}
