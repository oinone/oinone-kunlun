import type { ActionDslDefinition } from '@oinone/kunlun-dsl';
import type { RuntimeClientAction } from '../../../runtime-metadata';
import type { RuntimeContext } from '../../runtime-context';

export function convertClientAction(
  runtimeContext: RuntimeContext,
  dsl: ActionDslDefinition,
  action: RuntimeClientAction
) {
  action.fun = dsl.fun;
}
