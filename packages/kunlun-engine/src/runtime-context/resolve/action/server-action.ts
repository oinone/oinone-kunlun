import { ActionDslDefinition } from '@kunlun/dsl';
import { RuntimeServerAction } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';
import { convertFunction, DslFunction } from './resolve-function';

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
