import { DslDefinition, XMLParse } from '@kunlun/dsl';
import {
  ClientType,
  createDefaultLayout,
  resolveView,
  RuntimeContext,
  RuntimeContextManager,
  RuntimeContextService,
  RuntimeContextServiceToken,
  RuntimeLayoutDefinition,
  RuntimeModelField,
  RuntimeRelatedField,
  RuntimeView,
  RuntimeViewAction
} from '@kunlun/engine';
import { ViewType } from '@kunlun/meta';
import { debugConsole, uniqueKeyGenerator } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { getDefaultMaskTemplate, maskTemplateEdit } from '@kunlun/vue-admin-layout';
import { isNil, isPlainObject, isString } from 'lodash-es';
import { LayoutManager, LayoutRegisterOptions, MaskManager } from '../../spi';
import { useInjectMetaContext } from './context';
import { ActiveLayoutEffectOpt } from './active';

function seekViewMask(viewAction: RuntimeViewAction, moduleName?: string): DslDefinition {
  let maskTemplate: string =
    MaskManager.selector({
      module: viewAction.moduleDefinition?.module || viewAction.resModuleDefinition?.module,
      moduleName: viewAction.moduleDefinition?.name || viewAction.resModuleDefinition?.name || moduleName,
      model: viewAction.model,
      actionName: viewAction.name
    })!;
  if (!maskTemplate) {
    maskTemplate = viewAction.resMaskDefinition?.template as string;
    if (maskTemplate) {
      debugConsole.log('使用后端mask', maskTemplate);
    }
  }
  let finalMaskTemplate: DslDefinition;
  if (maskTemplate) {
    finalMaskTemplate = maskTemplateEdit({ isDefault: false }, XMLParse.INSTANCE.parse(maskTemplate));
  } else {
    finalMaskTemplate = getDefaultMaskTemplate();
  }
  return finalMaskTemplate;
}

function seekViewLayout(
  view: RuntimeView,
  inline: boolean,
  viewLayout: RuntimeLayoutDefinition | undefined,
  viewType: ViewType,
  options: LayoutRegisterOptions
) {
  ActiveLayoutEffectOpt.setOption('Layout', options);

  const { layout } = view;
  let finalViewLayout: DslDefinition | string | undefined = LayoutManager.selector({
    ...options,
    layoutName: viewLayout?.name,
    inline
  });
  if (!finalViewLayout) {
    finalViewLayout = layout || viewLayout?.template;
    if (finalViewLayout) {
      debugConsole.run(() => {
        let debugLayout = finalViewLayout;
        if (isString(debugLayout) && debugLayout.startsWith('{')) {
          try {
            debugLayout = JSON.parse(debugLayout);
          } catch (e) {
            debugConsole.warn('JSON parse debug layout error', debugLayout);
          }
        }
        debugConsole.log('使用后端layout', debugLayout);
      });
    }
  }
  if (!finalViewLayout) {
    finalViewLayout = createDefaultLayout(viewType, inline);
  }
  return finalViewLayout;
}

export function createRuntimeContextByViewAction(
  viewAction: RuntimeViewAction,
  inline: boolean,
  nodeHandle?: string,
  rootHandle?: string
): RuntimeContext | undefined {
  const {
    model,
    name,
    modelName,
    module,
    moduleName,
    resModel,
    resModelName,
    resModule,
    resModuleName,
    resViewLayout,
    resViewType,
    resView
  } = viewAction;
  if (!resView) {
    return undefined;
  }
  const finalViewType = resViewType || resView.type;
  if (!finalViewType) {
    return undefined;
  }
  const { id: resViewId, name: resViewName, dsl, template } = resView;
  const runtimeContext = RuntimeContextManager.createOrReplace(
    nodeHandle,
    RuntimeContextManager.get(rootHandle || useInjectMetaContext()?.rootHandle?.value)
  );
  runtimeContext.viewAction = viewAction;
  const finalModel = resModel || model;
  const finalModelName = resModelName || modelName;
  const finalModule = resModule || module;
  const finalModuleName = resModuleName || moduleName;
  const viewLayout = seekViewLayout(resView, inline, resViewLayout, finalViewType, {
    viewType: finalViewType,
    module: finalModule,
    moduleName: finalModuleName,
    model: finalModel,
    modelName: finalModelName,
    viewName: resViewName,
    actionName: name
  });
  resView.id = resViewId;
  resView.type = finalViewType;
  resView.model = finalModel;
  resView.modelName = finalModelName;
  resView.module = finalModule;
  resView.moduleName = finalModuleName;
  resView.layout = viewLayout;
  resView.dsl = dsl;
  resView.template = template;
  resolveView(runtimeContext, resView);
  return runtimeContext;
}

export function createRuntimeContextByView(
  view: RuntimeView,
  inline: boolean,
  nodeHandle?: string,
  rootHandle?: string
): RuntimeContext {
  const { type, name, model, modelName, module, moduleName, dsl, template } = view;
  const runtimeContext = RuntimeContextManager.createOrReplace(
    nodeHandle,
    RuntimeContextManager.get(rootHandle || useInjectMetaContext()?.rootHandle?.value)
  );
  runtimeContext.view = view;
  const viewLayout = seekViewLayout(view, inline, undefined, type, {
    viewType: type,
    module,
    moduleName,
    model,
    modelName,
    viewName: name,
    field: runtimeContext.field?.data
  });
  view.type = type;
  view.model = model;
  view.modelName = modelName;
  view.module = module;
  view.moduleName = moduleName;
  view.layout = viewLayout;
  view.dsl = dsl;
  view.template = template;
  resolveView(runtimeContext, view);
  return runtimeContext;
}

export function createRuntimeContextByFieldSubview(
  view: RuntimeView,
  field: RuntimeModelField,
  inline: boolean,
  nodeHandle?: string,
  rootHandle?: string
): RuntimeContext {
  const { type, name, model, modelName, module, moduleName, dsl, template } = view;
  const runtimeContext = RuntimeContextManager.createOrReplace(
    nodeHandle,
    RuntimeContextManager.get(rootHandle || useInjectMetaContext()?.rootHandle?.value)
  );
  runtimeContext.view = view;
  runtimeContext.field = field;
  const viewLayout = seekViewLayout(view, inline, undefined, type, {
    viewType: type,
    module,
    moduleName,
    model,
    modelName,
    viewName: name,
    ttype: field.ttype,
    relatedTtype: (field as RuntimeRelatedField).relatedTtype,
    field: field.data
  });
  view.type = type;
  view.model = model;
  view.modelName = modelName;
  view.module = module;
  view.moduleName = moduleName;
  view.layout = viewLayout;
  view.dsl = dsl;
  view.template = template;
  resolveView(runtimeContext, view);
  return runtimeContext;
}

export function createOrUpdateRuntimeContextByDslDefinition(dslDefinition: DslDefinition, nodeHandle?: string) {
  const {
    viewType: parentViewType,
    model: parentModel,
    modelName: parentModelName,
    module: parentModule,
    moduleName: parentModuleName
  } = useInjectMetaContext();
  const runtimeContext = RuntimeContextManager.createOrReplace(
    nodeHandle,
    RuntimeContextManager.get(useInjectMetaContext()?.rootHandle.value)
  );
  let { type, model, modelName, module, moduleName } = dslDefinition;
  const { name, filter, domain, initialValue, context } = dslDefinition;
  if (!type) {
    type = parentViewType.value;
  }
  if (!model) {
    model = parentModel.value;
  }
  if (!modelName) {
    modelName = parentModelName.value;
  }
  if (!module) {
    module = parentModule.value;
  }
  if (!moduleName) {
    moduleName = parentModuleName.value;
  }
  const view: RuntimeView = {
    ...(runtimeContext.view || {}),
    model,
    name,
    modelName,
    type,
    module,
    moduleName,
    template: dslDefinition
  };
  if (filter && isString(filter)) {
    view.filter = filter;
  }
  if (domain && isString(domain)) {
    view.domain = domain;
  }
  if (initialValue && Array.isArray(initialValue)) {
    view.initialValue = initialValue;
  }
  if (context && isPlainObject(context)) {
    view.context = context;
  }
  resolveView(runtimeContext, view);
  return runtimeContext;
}

/**
 * 为组件创建运行时上下文，一般用于直接创建组件的场景
 * 注：deep属性必须保持一致
 * @param view 运行时视图
 * @param options 创建可选项 默认值: mergeLayout = false, deep = true
 * @return 组件运行时上下文
 */
export function createRuntimeContextForWidget(
  view: RuntimeView,
  options?: { mergeLayout?: boolean; deep?: boolean }
): RuntimeContext {
  const handle = uniqueKeyGenerator();
  const runtimeContext = createRuntimeContextByView(
    options?.mergeLayout
      ? view
      : {
          ...view,
          template: view.template || view.dsl
        },
    true,
    handle,
    handle
  );
  if (isNil(options?.deep) || options?.deep) {
    runtimeContext.deepResolve();
  }
  return runtimeContext;
}

@SPI.Service(RuntimeContextServiceToken, { name: ClientType.pc, priority: 0 })
export class RuntimeContextServiceImpl implements RuntimeContextService {
  public createRuntimeContextByViewAction(
    viewAction: RuntimeViewAction,
    inline: boolean,
    nodeHandle?: string,
    rootHandle?: string
  ): RuntimeContext | undefined {
    return createRuntimeContextByViewAction(viewAction, inline, nodeHandle, rootHandle);
  }

  public seekViewMask(viewAction: RuntimeViewAction, moduleName?: string): DslDefinition {
    return seekViewMask(viewAction, moduleName);
  }
}
