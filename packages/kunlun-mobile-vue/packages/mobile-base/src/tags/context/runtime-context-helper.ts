import { DslDefinition, DslDefinitionType } from '@oinone/kunlun-dsl';
import {
  ClientType,
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
} from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, debugConsole, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { isNil, isPlainObject, isString } from 'lodash-es';
import { LayoutManager, LayoutRegisterOptions } from '../../spi';
import { findWidget } from '../../util/utils';
import { useInjectMetaContext } from './context';
import { createMobileDefaultLayout } from './default-layout';
import { ActiveLayoutEffectOpt } from './active';

function addTableWidgetStyle(widgetObj: any) {
  const { slot, widget, type, dslNodeType, widgets = [] as any[] } = widgetObj || {};
  if (type === 'SEARCH' && dslNodeType === 'view') {
    return false;
  }
  if (slot === 'tableGroup' && widget === 'group') {
    widgetObj.style = 'height: 100%;flex: 1;overflow-y: hidden;';
    return true;
  }
  for (const item of widgets) {
    const ret = addTableWidgetStyle(item);
    if (ret) {
      return true;
    }
  }
  return false;
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
  if (!finalViewLayout && inline && ![ViewType.Table, ViewType.Gallery].includes(viewType)) {
    // 第一层的表格、画廊无法支持自定义布局
    finalViewLayout = layout || viewLayout?.template;
    if (finalViewLayout) {
      debugConsole.run(() => {
        let debugLayout = finalViewLayout;
        if (isString(debugLayout) && debugLayout.startsWith('{')) {
          try {
            debugLayout = JSON.parse(debugLayout);
          } catch (e) {
            console.warn('JSON parse debug layout error', debugLayout);
          }
        }
        console.log('使用后端layout', debugLayout);
      });
    }
  }
  if (!finalViewLayout) {
    finalViewLayout = createMobileDefaultLayout(viewType, inline);
  }
  if (isString(finalViewLayout)) {
    try {
      finalViewLayout = JSON.parse(finalViewLayout);
    } catch (e) {
      console.error('viewLayout parse err', e);
    }
    addTableWidgetStyle(finalViewLayout);
  }
  return finalViewLayout;
}

export function createRuntimeContextByViewAction(
  viewAction: RuntimeViewAction,
  inline: boolean,
  nodeHandle?: string,
  rootHandle?: string
): RuntimeContext | undefined {
  // viewAction = tableViewToGalleryView(viewAction);
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

// 表格模式转换画廊展示，画廊内容区默认最多展示的字段数
const GALLERY_CONTENT_SHOW_FIELDS_MAX_LENGTH = 3;

/**
 * 移动端表格可通过env的TABLE_DISPLAY_GALLERY配置默认以画廊展示
 * @param viewAction
 */
export function tableViewToGalleryView(viewAction: RuntimeViewAction) {
  if (
    viewAction.resViewType !== ViewType.Table ||
    (viewAction.name === 'homepage' && viewAction.model === 'workbench.WorkBenchHomePage')
  ) {
    return viewAction;
  }
  const dslObj = JSON.parse((viewAction.resView?.dsl as string) || '{}');
  if (dslObj.type !== ViewType.Table) {
    return viewAction;
  }
  const isTableDisplayGallery = process.env.TABLE_DISPLAY_GALLERY !== 'false';
  if (!(isTableDisplayGallery || BooleanHelper.toBoolean(dslObj.showWithGallery) === true)) {
    return viewAction;
  }

  const tableWidget =
    findWidget(dslObj, DslDefinitionType.TEMPLATE, 'table', '', ['search', 'actionBar', 'action-bar']) ||
    findWidget(dslObj, DslDefinitionType.TEMPLATE, 'fields', '', ['search', 'actionBar', 'action-bar']);
  if (tableWidget) {
    viewAction.resViewType = ViewType.Gallery;
    viewAction.viewType = ViewType.Gallery;
    viewAction.resView = { ...viewAction.resView, type: ViewType.Gallery } as RuntimeView;
    dslObj.widget = 'gallery';
    dslObj.type = ViewType.Gallery;

    tableWidget.slot = 'gallery';
    tableWidget.widget = 'gallery';
    if (!tableWidget.showFieldsMaxLength) {
      tableWidget.showFieldsMaxLength = GALLERY_CONTENT_SHOW_FIELDS_MAX_LENGTH;
    }
    const fieldWidgets = tableWidget.widgets.filter((a) => a.dslNodeType === DslDefinitionType.FIELD);
    let rowActionWidget = findWidget(tableWidget, DslDefinitionType.TEMPLATE, 'rowActions');
    rowActionWidget = rowActionWidget || findWidget(dslObj, DslDefinitionType.TEMPLATE, 'rowActions');
    tableWidget.widgets = [
      {
        dslNodeType: DslDefinitionType.TEMPLATE,
        slot: 'card',
        // widget: 'card',
        widgets: [
          // TODO 取模型的label字段
          {
            dslNodeType: DslDefinitionType.TEMPLATE,
            slot: 'title',
            invisible: false,
            widgets: [
              {
                ...fieldWidgets.find((a) => BooleanHelper.isFalse(a.invisible)),
                invisible: false,
                labelInvisible: true,
                widget: 'ModelLabelWidget'
              }
            ]
          },
          {
            dslNodeType: DslDefinitionType.TEMPLATE,
            slot: 'content',
            widgets: fieldWidgets
          },
          ...(!rowActionWidget ? [] : [rowActionWidget])
        ],
        area: 'title,content,rowActions'
      }
    ];
  } else {
    console.warn('tableWidget slot not fund', dslObj);
  }

  viewAction.resView = { ...viewAction.resView, dsl: JSON.stringify(dslObj) } as RuntimeView;
  return viewAction;
}

@SPI.Service(RuntimeContextServiceToken, { name: ClientType.mobile, priority: 0 })
export class MobileRuntimeContextServiceImpl implements RuntimeContextService {
  public createRuntimeContextByViewAction(
    viewAction: RuntimeViewAction,
    inline: boolean,
    nodeHandle?: string,
    rootHandle?: string
  ): RuntimeContext | undefined {
    return createRuntimeContextByViewAction(viewAction, inline, nodeHandle, rootHandle);
  }

  public seekViewMask(viewAction: RuntimeViewAction): DslDefinition | undefined {
    return undefined;
  }
}
