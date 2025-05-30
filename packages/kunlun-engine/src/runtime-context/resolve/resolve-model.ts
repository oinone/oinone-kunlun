import { cloneDeep } from 'lodash-es';
import { RuntimeModel } from '../../runtime-metadata';
import { RuntimeContext } from '../runtime-context';
import { ResolveUtil } from './util';

export function resolveModel(runtimeContext: RuntimeContext) {
  let modelDefinition: RuntimeModel | undefined =
    runtimeContext.view.modelDefinition ||
    runtimeContext.viewAction?.resModelDefinition ||
    runtimeContext.viewAction?.modelDefinition;
  if (modelDefinition) {
    modelDefinition = cloneDeep(modelDefinition);
  } else {
    modelDefinition = runtimeContext.model || runtimeContext.getModel(runtimeContext.view.model)?.model;
    if (modelDefinition) {
      modelDefinition = cloneDeep(modelDefinition);
    }
  }
  const { model, modelName: name, module, moduleName } = runtimeContext.view;
  const finalTemplate = runtimeContext.viewTemplate;
  runtimeContext.model = {
    ...(modelDefinition || {}),
    model,
    name,
    module: module || runtimeContext.module?.module,
    moduleName: moduleName || runtimeContext.module?.name,
    modelFields: [],
    modelActions: [],
    pks: ResolveUtil.toArray(finalTemplate.pk) || modelDefinition?.pks,
    uniques:
      ResolveUtil.toArray(finalTemplate.uniques)
        ?.map((v) => ResolveUtil.toArray(v)!)
        .filter((v) => !v) || modelDefinition?.uniques,
    indexes:
      ResolveUtil.toArray(finalTemplate.indexes)
        ?.map((v) => ResolveUtil.toArray(v)!)
        .filter((v) => !v) || modelDefinition?.indexes,
    sorting: finalTemplate.ordering || modelDefinition?.sorting
  };
}
