import { ActionDslDefinition } from '@oinone/kunlun-dsl';
import { ActionContextType, ActionType, ViewType } from '@oinone/kunlun-meta';
import { uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { generatorModelName, RuntimeAction } from '../../../runtime-metadata';
import { parseConfigs } from '../../../util';
import { RuntimeContext } from '../../runtime-context';
import { ResolveUtil } from '../util';
import { selectorConverters } from './spi';

export function resolveAction(runtimeContext: RuntimeContext, dsl: ActionDslDefinition) {
  const actions = runtimeContext.model.modelActions;
  const action = convert(runtimeContext, dsl);
  if (action) {
    const metadataIndex = actions.length;
    dsl.__metadata_index = metadataIndex;
    action.__index = metadataIndex;
    actions.push(action);
  }

  return action;
}

export function convert(runtimeContext: RuntimeContext, dsl: ActionDslDefinition): RuntimeAction | undefined {
  const model = ResolveUtil.getAndRepairModel(runtimeContext, dsl);
  if (!model) {
    console.error('action model is required.', runtimeContext, dsl);
    return undefined;
  }
  return convertRuntimeAction(runtimeContext, model, dsl, (action) => {
    selectorConverters({
      actionType: action.actionType
    }).forEach((resolve) => resolve(runtimeContext, dsl, action));
  });
}

export function convertRuntimeAction(
  runtimeContext: RuntimeContext,
  model: string,
  dsl: ActionDslDefinition,
  consumer?: (action: RuntimeAction) => void
): RuntimeAction | undefined {
  const actionType = getAndRepairActionType(dsl);
  if (!actionType) {
    console.error('action type is required.', dsl);
    return undefined;
  }
  const name = getAndRepairName(dsl);
  if (!name) {
    console.error('action name is required.', dsl);
    return undefined;
  }
  const { mappingConfig, contextConfig } = parseConfigs(dsl, [
    { key: 'mappingConfig', prefix: 'mapping' },
    { key: 'contextConfig', prefix: 'context' }
  ]);
  const action: RuntimeAction = {
    id: dsl.id,
    template: dsl,
    model,
    modelName: dsl.modelName || generatorModelName(model),
    name,
    widget: dsl.widget,
    actionType,
    contextType: dsl.contextType?.toUpperCase() as ActionContextType,
    bindingType: ResolveUtil.toArray<string>(dsl.bindingType)?.map((v) => v.toUpperCase() as ViewType),
    bindingViewName: dsl.bindingViewName,
    priority: ResolveUtil.toNumberNullable(dsl.priority),
    invisible: dsl.invisible,
    disabled: dsl.disabled,
    displayName: dsl.displayName,
    label: dsl.label,
    mapping: {
      ...ResolveUtil.toRecord(dsl.mapping),
      ...(mappingConfig || {})
    },
    context: {
      ...ResolveUtil.toRecord(dsl.context),
      ...(contextConfig || {})
    },
    sessionPath: dsl.sessionPath
  };
  consumer?.(action);
  ResolveUtil.clearUndefined(action);
  action.modelDefinition = runtimeContext.model;
  return action;
}

function getAndRepairActionType(dsl: ActionDslDefinition) {
  const widget = dsl.widget as string;
  let type = dsl.actionType;
  if (!type) {
    switch (widget) {
      case 'UrlAction':
        type = ActionType.URL;
        break;
      case 'ServerAction':
        type = ActionType.Server;
        break;
      case 'ViewAction':
        type = ActionType.View;
        break;
      default:
        type = ActionType.Client;
        break;
    }
  }
  dsl.actionType = type;
  return type;
}

export function getAndRepairName(dsl: ActionDslDefinition) {
  let { name } = dsl;
  if (!name) {
    const { actionType } = dsl;
    if (actionType === ActionType.Client) {
      name = dsl.fun;
    } else if (actionType === ActionType.Composition) {
      name = uniqueKeyGenerator();
    }
    dsl.name = name;
  }
  return name;
}
