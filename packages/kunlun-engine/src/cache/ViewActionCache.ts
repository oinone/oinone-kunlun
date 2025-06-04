import { ActionContextType, ActionType, IModel, IModule, IViewAction, ViewMode, ViewType } from '@oinone/kunlun-meta';
import { isNotPermission } from '@oinone/kunlun-request';
import { queryHomePageDsl, queryPageDslByModelAndName, queryPageDslBySharedCode } from '@oinone/kunlun-service';
import {
  RuntimeFunctionDefinition,
  RuntimeModel,
  RuntimeModule,
  RuntimeViewAction,
  SharedRuntimeViewAction
} from '../runtime-metadata';
import { MemoryAsyncCache } from './cache';
import { ClearCache } from './CacheClear';
import { toRecord } from './helper';
import { ModelCache } from './ModelCache';
import { debugConsole, UrlHelper } from '@oinone/kunlun-shared';

interface ViewActionKey {
  model: string;
  name: string;
}

abstract class AbstractViewActionCache<K = string, V = RuntimeViewAction> extends MemoryAsyncCache<K, V> {
  public async set(key: K, value: V | undefined) {
    const finalKey = this.cacheKeyFormat(this.keyGenerator(key));
    value = await this.unsafeSetCache(finalKey, value);
    return value;
  }

  public async setOfNullable(key: K, value: V | undefined) {
    const finalKey = this.cacheKeyFormat(this.keyGenerator(key));
    const cacheValue = await this.getCache(finalKey);
    if (cacheValue == null) {
      value = await this.unsafeSetCache(finalKey, value);
    }
    return value;
  }
}

class ViewActionInternalCache extends AbstractViewActionCache<ViewActionKey> {
  public static INSTANCE = new ViewActionInternalCache();

  public async fetchValue(key: ViewActionKey): Promise<RuntimeViewAction | undefined> {
    const viewAction: IViewAction = await queryPageDslByModelAndName(key.model, key.name);
    if (viewAction) {
      return viewActionConvertRuntime(viewAction);
    }
    return undefined;
  }

  protected keyGenerator(key: ViewActionKey): string {
    return `${key.model}#${key.name}`;
  }
}

class HomepageInternalCache extends AbstractViewActionCache {
  public static INSTANCE = new HomepageInternalCache();

  public static APPLICATION_HOMEPAGE = '__application_homepage__';

  public async fetchValue(key: string): Promise<RuntimeViewAction | undefined> {
    let viewAction: IViewAction;

    try {
      viewAction = await queryHomePageDsl({
        module: key === HomepageInternalCache.APPLICATION_HOMEPAGE ? undefined : key
      } as IViewAction);
      if (viewAction) {
        return viewActionConvertRuntime(viewAction);
      }
      return viewAction;
    } catch (e) {
      if (isNotPermission(e)) {
        return undefined;
      }
      throw e;
    }
  }
}

class SharedViewActionInternalCache extends AbstractViewActionCache<string, SharedRuntimeViewAction> {
  public static INSTANCE = new SharedViewActionInternalCache();

  public async fetchValue(sharedCode: string): Promise<SharedRuntimeViewAction | undefined> {
    const viewAction = await queryPageDslBySharedCode(sharedCode);
    if (viewAction.sharedParameters) {
      const runtimeViewAction = (await viewActionConvertRuntime(viewAction)) as unknown as SharedRuntimeViewAction;
      runtimeViewAction.sharedCode = viewAction.sharedCode;
      runtimeViewAction.authorizationCode = viewAction.authorizationCode;
      runtimeViewAction.sharedParameters = JSON.parse(viewAction.sharedParameters);
      runtimeViewAction.browserTitle = viewAction.browserTitle;
      runtimeViewAction.language = viewAction.language;
      runtimeViewAction.languageIsoCode = viewAction.languageIsoCode;
      return runtimeViewAction;
    }
    return undefined;
  }
}

export class ViewActionCache {
  public static async get(model: string, name: string, force = false): Promise<RuntimeViewAction | undefined> {
    if (!model) {
      console.error('view action model is required.');
      return undefined;
    }
    if (!name) {
      console.error('view action name is required.');
      return undefined;
    }
    const key: ViewActionKey = { model, name };
    if (force) {
      return ViewActionInternalCache.INSTANCE.fetchValue(key);
    }
    return ViewActionInternalCache.INSTANCE.get(key);
  }

  public static async getOrThrow(model: string, name: string, force = false): Promise<RuntimeViewAction | undefined> {
    if (!model) {
      console.error('view action model is required.');
      return undefined;
    }
    if (!name) {
      console.error('view action name is required.');
      return undefined;
    }
    const key: ViewActionKey = { model, name };
    if (force) {
      return ViewActionInternalCache.INSTANCE.fetchValue(key);
    }
    return ViewActionInternalCache.INSTANCE.getOrThrow(key);
  }

  public static async getHomepage(module?: string, force = false): Promise<RuntimeViewAction | undefined> {
    const key = module || HomepageInternalCache.APPLICATION_HOMEPAGE;
    if (force) {
      return HomepageInternalCache.INSTANCE.fetchValue(key);
    }
    const target = await HomepageInternalCache.INSTANCE.get(key);
    if (target && target.name) {
      if (key === HomepageInternalCache.APPLICATION_HOMEPAGE && target.module) {
        HomepageInternalCache.INSTANCE.setOfNullable(target.module, target);
      }
      ViewActionInternalCache.INSTANCE.setOfNullable(
        {
          model: target.model,
          name: target.name
        },
        target
      );
    }
    return target;
  }

  public static async getSharedAction(sharedCode: string, force = false) {
    if (!sharedCode) {
      console.error('shared code is required.');
      return undefined;
    }
    if (force) {
      return SharedViewActionInternalCache.INSTANCE.fetchValue(sharedCode);
    }
    const target = await SharedViewActionInternalCache.INSTANCE.get(sharedCode);
    if (target && target.model && target.name) {
      ViewActionInternalCache.INSTANCE.setOfNullable(
        {
          model: target.model,
          name: target.name
        },
        target
      );
    }
    return target;
  }

  public static async set(action: RuntimeViewAction) {
    await ViewActionInternalCache.INSTANCE.set({ model: action.model, name: action.name }, action);
  }
}

/**
 * <h3>跳转动作转换为运行时跳转动作</h3>
 * <p>请勿随意修改转换参数，未定义在该方法中的转换属性也不该被使用</p>
 * @param viewAction 跳转动作
 * @return 运行时跳转动作
 */
async function viewActionConvertRuntime(viewAction: IViewAction): Promise<RuntimeViewAction> {
  const {
    name,
    title,
    displayName,
    contextType,
    target,
    domain,
    filter,
    load,
    loadFunction,
    viewType,
    model,
    module,
    moduleName,
    moduleDefinition,
    maskDefinition,
    resModel,
    resModule,
    resModuleName,
    resModuleDefinition,
    resView,
    resViewName,
    theme,
    sessionPath,
    context
  } = viewAction;
  debugConsole.prettySuccess(
    'viewAction debug url',
    `${location.origin}${UrlHelper.appendBasePath(
      `/debug;module=${moduleName};viewType=${viewType};model=${model};action=${name};target=${target}`
    )}`
  );
  let runtimeModule: RuntimeModule | undefined;
  const finalModule = moduleDefinition?.module || module;
  if (finalModule && moduleName) {
    runtimeModule = moduleConvertRuntime((moduleDefinition || {}) as IModule, finalModule, moduleName);
  }
  let runtimeResModule: RuntimeModule | undefined;
  const finalResModule = resModuleDefinition?.module || resModule;
  if (finalResModule && resModuleName) {
    runtimeResModule = moduleConvertRuntime((resModuleDefinition || {}) as IModule, finalResModule, resModuleName);
  }
  let runtimeModel: RuntimeModel | undefined;
  const { modelDefinition, resModelDefinition } = viewAction;
  if (modelDefinition) {
    runtimeModel = modelConvertRuntime(modelDefinition, runtimeModule);
  } else if (model) {
    runtimeModel = await ModelCache.get(model);
  }
  let runtimeResModel: RuntimeModel | undefined;
  if (resModelDefinition) {
    // fixme @zbh 20220727 resModelDefinition在模型相同的情况下无法正确获取数据
    runtimeResModel = modelConvertRuntime(
      model === resModel
        ? {
            ...(modelDefinition || {}),
            ...resModelDefinition
          }
        : resModelDefinition,
      runtimeResModule
    );
  } else if (resModel) {
    runtimeResModel = await ModelCache.get(resModel);
  }
  const modelName = runtimeModel?.name || modelDefinition?.name || model;
  const resModelName = runtimeResModel?.name || resModelDefinition?.name || resModel;
  const runtimeViewAction: RuntimeViewAction = {
    actionType: ActionType.View,
    name,
    title,
    displayName,
    contextType,
    target,
    domain,
    filter,
    load,
    model,
    modelName,
    module,
    moduleName,
    maskDefinition,
    resModel,
    resModelName,
    resModule,
    resModuleName,
    resMaskDefinition: maskDefinition,
    resViewType: viewType,
    resViewMode: computeViewMode(viewType, contextType),
    theme,
    sessionPath,
    context
  };
  if (runtimeModule) {
    runtimeViewAction.moduleDefinition = runtimeModule;
  }
  if (runtimeResModule) {
    runtimeViewAction.resModuleDefinition = runtimeResModule;
  }
  if (runtimeModel) {
    runtimeViewAction.modelDefinition = runtimeModel;
  }
  if (runtimeResModel) {
    runtimeViewAction.resModelDefinition = runtimeResModel;
  }
  runtimeViewAction.resViewName = resViewName;
  if (resView) {
    const {
      id: resViewId,
      name: viewName,
      title: resViewTitle,
      type: resViewType,
      template: resViewDsl,
      extension: resViewExtension,
      baseLayoutDefinition
    } = resView;
    if (baseLayoutDefinition) {
      const { name: layoutName, template: layoutTemplate } = baseLayoutDefinition;
      runtimeViewAction.resViewLayout = {
        name: layoutName,
        template: layoutTemplate
      };
    }
    runtimeViewAction.resViewType = resViewType;
    runtimeViewAction.resView = {
      id: resViewId,
      name: viewName,
      title: resViewTitle,
      type: resViewType,
      model: resModel || model,
      modelName: resModelName || modelName,
      module: finalResModule || finalModule,
      moduleName: resModelName || moduleName,
      dsl: resViewDsl,
      extension: toRecord(resViewExtension)
    };
  }
  if (loadFunction) {
    runtimeViewAction.loadFunctionDefinition = loadFunction as unknown as RuntimeFunctionDefinition;
  }
  return runtimeViewAction;
}

export function computeViewMode(viewType: ViewType, contextType: ActionContextType): ViewMode {
  switch (viewType) {
    case ViewType.Table:
    case ViewType.Gallery:
    case ViewType.Detail:
      return ViewMode.Lookup;
    case ViewType.Form:
      if (contextType === ActionContextType.ContextFree) {
        return ViewMode.Create;
      }
      return ViewMode.Editor;
    default:
      return ViewMode.Create;
  }
}

function moduleConvertRuntime(module: IModule, moduleModule?: string, moduleName?: string): RuntimeModule {
  return {
    module: moduleModule || module.module,
    name: moduleName || module.name,
    displayName: module.displayName
  };
}

/**
 * <h3>模型转换为运行时模型</h3>
 * <p>请勿随意修改转换参数，未定义在该方法中的转换属性也不该被使用</p>
 * @param model 模型
 * @param module 模块
 * @return 运行时模型
 */
function modelConvertRuntime(model: IModel, module?: RuntimeModule): RuntimeModel {
  return {
    model: model.model,
    name: model.name,

    modelFields: [],
    modelActions: [],

    type: model.type,
    module: module?.module,
    moduleName: module?.name || model.moduleName,
    moduleDefinition: module,
    pks: model.pk,
    uniques: model.uniques?.map((v) => v.split(',')),

    label: model.label,
    labelFields: model.labelFields
  };
}

ClearCache.register(() => {
  ViewActionInternalCache.INSTANCE.clear();
  HomepageInternalCache.INSTANCE.clear();
});
