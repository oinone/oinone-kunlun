import { ActionDslDefinition, DslDefinitionHelper } from '@oinone/kunlun-dsl';
import { RuntimeAction, RuntimeCompositionAction } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';
import { convert } from './resolve';

export function convertCompositionAction(
  runtimeContext: RuntimeContext,
  dsl: ActionDslDefinition,
  action: RuntimeCompositionAction
) {
  const actionDslDefinitions = dsl.widgets || [];
  const actions: RuntimeAction[] = [];
  for (const actionDslDefinition of actionDslDefinitions) {
    if (DslDefinitionHelper.isAction(actionDslDefinition)) {
      const childAction = convert(runtimeContext, actionDslDefinition);
      if (childAction) {
        childAction.__index = actions.length;
        actions.push(childAction);
      }
    }
  }
  action.actions = actions;
}
