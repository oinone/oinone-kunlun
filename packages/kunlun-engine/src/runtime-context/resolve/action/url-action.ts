import type { ActionDslDefinition } from '@oinone/kunlun-dsl';
import type { RuntimeUrlAction } from '../../../runtime-metadata';
import type { RuntimeContext } from '../../runtime-context';

export function convertUrlAction(runtimeContext: RuntimeContext, dsl: ActionDslDefinition, action: RuntimeUrlAction) {
  action.url = dsl.url;
  action.target = dsl.target?.toUpperCase?.();
  action.computeFunction = dsl.computeFunction;
  action.compute = dsl.compute;
}
