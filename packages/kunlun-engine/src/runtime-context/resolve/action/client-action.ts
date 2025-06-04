import { ActionDslDefinition } from '@oinone/kunlun-dsl';
import { RuntimeClientAction } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';

export function convertClientAction(
  runtimeContext: RuntimeContext,
  dsl: ActionDslDefinition,
  action: RuntimeClientAction
) {
  action.fun = dsl.fun;
}
