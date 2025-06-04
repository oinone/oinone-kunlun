import {
  IClientAction,
  IModel,
  IModelField,
  IModelFieldOption,
  IServerAction,
  IURLAction,
  IViewAction,
  ViewType
} from '@oinone/kunlun-meta';
import { getModel, getModelByFields } from '@oinone/kunlun-service';
import { ResolveUtil } from '../runtime-context/resolve/util';
import { RuntimeAction, RuntimeEnumerationOption, RuntimeModel, RuntimeModelField } from '../runtime-metadata';
import { MemoryAsyncCache } from './cache';
import { ClearCache } from './CacheClear';

class ModelInternalCache extends MemoryAsyncCache<string, RuntimeModel> {
  public static INSTANCE = new ModelInternalCache();

  public async fetchValue(key: string): Promise<RuntimeModel | undefined> {
    const model = await getModelByFields(key);
    if (model.model) {
      return modelConvertRuntime(model);
    }
    return undefined;
  }
}

class ModelAllInternalCache extends MemoryAsyncCache<string, RuntimeModel> {
  public static INSTANCE = new ModelAllInternalCache();

  public async fetchValue(key: string): Promise<RuntimeModel | undefined> {
    const model = await getModel(key);
    if (model.model) {
      return modelConvertRuntime(model);
    }
    return undefined;
  }
}

export class ModelCache {
  /**
   * 通过模型编码获取模型
   * @param model 模型编码
   * @param force 强制查询
   */
  public static async get(model: string, force = false): Promise<RuntimeModel | undefined> {
    const key: string = model;
    if (force) {
      return ModelInternalCache.INSTANCE.fetchValue(key);
    }
    return ModelInternalCache.INSTANCE.get(key);
  }

  /**
   * 通过模型编码获取全部模型数据
   * @param model 模型编码
   * @param force 强制查询
   * @deprecated since 5.0
   */
  public static async getAll(model: string, force = false): Promise<RuntimeModel | undefined> {
    const key: string = model;
    if (force) {
      return ModelAllInternalCache.INSTANCE.fetchValue(key);
    }
    return ModelAllInternalCache.INSTANCE.get(key);
  }
}

function modelConvertRuntime(model: IModel): RuntimeModel {
  const {
    id,
    model: modelModel,
    name,
    type,
    module,
    moduleName,
    pk,
    uniques,
    label,
    labelFields,
    modelFields,
    serverActionList,
    viewActionList,
    urlActionList,
    clientActionList
  } = model;
  const runtimeModel: RuntimeModel = {
    id,
    model: modelModel,
    name,
    type,
    module,
    moduleName,
    pks: pk,
    uniques: uniques?.map((v) => ResolveUtil.toArray(v)!) || [],
    label,
    labelFields,
    modelFields: [],
    modelActions: []
  };
  runtimeModel.modelFields = modelFields?.map((field) => modelFieldConvertRuntime(runtimeModel, field)) || [];
  runtimeModel.modelActions =
    [
      ...(serverActionList || []),
      ...(viewActionList || []),
      ...(urlActionList || []),
      ...(clientActionList || [])
    ]?.map((action) => modelActionConvertRuntime(runtimeModel, action as any)) || [];
  return runtimeModel;
}

function modelFieldConvertRuntime(model: RuntimeModel, field: IModelField): RuntimeModelField {
  const {
    id,
    field: data,
    name,
    ttype,
    multi,
    defaultValue,
    store,
    storeSerialize,
    displayName,
    label,
    required,
    readonly,
    invisible,

    related,
    relatedTtype,

    relationStore,
    references,
    relationFields,
    referenceFields,
    through,
    throughRelationFields,
    throughReferenceFields,
    limit,
    domain,

    size,
    decimal,
    max,
    min,

    options
  } = field;
  const runtimeModelField: RuntimeModelField & Record<string, unknown> = {
    id,
    model: model.model,
    modelName: model.name,
    modelDefinition: model,
    data: data || name,
    name: name || (data as string),
    ttype,
    multi,
    defaultValue,
    store: store || false,
    storeSerialize,
    displayName,
    label,
    required,
    readonly,
    invisible,

    related: related || [],
    relatedTtype,

    relationStore,
    references,
    relationFields,
    referenceFields,
    through,
    throughRelationFields,
    throughReferenceFields,
    limit: ResolveUtil.toNumberOrStringNullable(limit),
    domain,

    size: ResolveUtil.toNumberOrStringNullable(size),
    decimal: ResolveUtil.toNumberOrStringNullable(decimal),
    max: ResolveUtil.toNumberOrStringNullable(max),
    min: ResolveUtil.toNumberOrStringNullable(min)
  };
  runtimeModelField.options = enumerationOptionsConvertRuntime(options);
  return runtimeModelField;
}

function enumerationOptionsConvertRuntime(options: IModelFieldOption[] | undefined): RuntimeEnumerationOption[] {
  const runtimeOptions: RuntimeEnumerationOption[] = [];
  options?.forEach((option) => {
    const {
      name,
      value,
      label,
      displayName,
      hint,
      thumbnail,
      invisible,
      isDefault,
      color,
      backgroundColor,
      icon,
      state
    } = option;
    if (!name) {
      return;
    }
    runtimeOptions.push({
      state,
      name,
      value,
      displayName: displayName || label,
      hint,
      thumbnail,

      invisible,
      isDefault,

      color,
      backgroundColor,
      icon
    });
  });
  return runtimeOptions;
}

function modelActionConvertRuntime(
  model: RuntimeModel,
  action: IClientAction & IURLAction & IServerAction & IViewAction
): RuntimeAction {
  const {
    id,
    name,
    actionType,
    contextType,
    bindingType,
    priority,
    invisible,
    displayName,
    label,

    target,
    domain,
    filter,
    module,
    moduleName,
    fun,
    url
  } = action;
  const runtimeAction: RuntimeAction & Record<string, unknown> = {
    id,
    model: model.model,
    modelName: model.name,
    modelDefinition: model,
    name,
    actionType,
    contextType: contextType!,
    bindingType: bindingType as ViewType[],
    priority,
    invisible,
    displayName,
    label,

    target,
    domain,
    filter,
    module,
    moduleName,
    fun,
    url
  };
  return runtimeAction;
}

ClearCache.register(() => {
  ModelInternalCache.INSTANCE.clear();
  ModelAllInternalCache.INSTANCE.clear();
});
