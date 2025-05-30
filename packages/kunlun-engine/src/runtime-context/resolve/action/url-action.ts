import { ActionDslDefinition } from '@kunlun/dsl';
import { RuntimeUrlAction } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';

export function convertUrlAction(runtimeContext: RuntimeContext, dsl: ActionDslDefinition, action: RuntimeUrlAction) {
  action.url = dsl.url;
  action.target = dsl.target?.toUpperCase?.();
  action.computeFunction = dsl.computeFunction;
  action.compute = dsl.compute;
}
