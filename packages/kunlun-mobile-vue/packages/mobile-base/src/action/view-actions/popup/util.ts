import {
  ActionDslDefinition,
  DEFAULT_CHILDREN_KEY,
  DEFAULT_SLOT_NAME,
  DslDefinition,
  DslDefinitionHelper,
  DslDefinitionType,
  DslSlotUtils,
  ElementDslDefinition,
  IGNORED_TEMPLATE_DSL_KEYS,
  TemplateDslDefinition,
  UnknownDslDefinition,
  ViewDslDefinition
} from '@oinone/kunlun-dsl';
import {
  DisposeEventHandler,
  IPopupInstance,
  ModelCache,
  OpenEventHandler,
  PopupManager,
  resolveDslDefinition,
  RuntimeAction,
  RuntimeView,
  RuntimeViewAction,
  translateValueByKey,
  ViewActionCache
} from '@oinone/kunlun-engine';
import { ActionType, ModelDefaultActionName, ViewType } from '@oinone/kunlun-meta';
import { debugConsole, Optional } from '@oinone/kunlun-shared';
import { ButtonType } from '@oinone/kunlun-vue-ui-common';
import { nextTick } from 'vue';
import { useSessionPath } from '@oinone/kunlun-request';
import { DETAIL_WIDGET, FORM_WIDGET, SEARCH_WIDGET, TABLE_WIDGET } from '../../../typing/widget-names';
import { generatorLayout } from '../../../spi';

export interface PopupDslDefinition {
  model: string;
  modelName: string;
  resModel: string;
  resModelName: string;
  module?: string;
  moduleName: string;
  resModule?: string;
  resModuleName: string;
  viewType: ViewType;
  viewDslNode: DslDefinition;
  dslDefinition: DslDefinition;
}

export function seekPopupDslDefinition(dsl: DslDefinition | undefined): {
  popupViewDslNode?: TemplateDslDefinition;
  currentViewDslNode?: ViewDslDefinition;
} {
  const result: Record<string, unknown> = {};
  const popupViewDslNode = dsl?.widgets?.find(
    (v) => v.dslNodeType === DslDefinitionType.TEMPLATE && v.slot === DEFAULT_SLOT_NAME
  );
  result.popupViewDslNode = popupViewDslNode;
  result.currentViewDslNode = (popupViewDslNode || dsl)?.widgets?.find((v) => v.dslNodeType === DslDefinitionType.VIEW);
  return result;
}

function deleteTemplateNode(viewDslNode: DslDefinition, slotNames: string[]) {
  slotNames.forEach((v) => {
    const { widgets } = viewDslNode;
    const index = widgets.findIndex(
      (vv) => vv.dslNodeType === DslDefinitionType.TEMPLATE && (vv as TemplateDslDefinition).slot === v
    );
    if (index !== -1) {
      widgets.splice(index, 1);
    }
  });
}

function createPopupDefaultLayout(type: ViewType): ViewDslDefinition {
  switch (type) {
    case ViewType.Table:
      return {
        dslNodeType: DslDefinitionType.VIEW,
        type,
        widgets: [
          {
            dslNodeType: DslDefinitionType.VIEW,
            type: ViewType.Search,
            widgets: [
              {
                dslNodeType: DslDefinitionType.ELEMENT,
                widget: SEARCH_WIDGET,
                slot: 'search',
                widgets: []
              } as ElementDslDefinition & TemplateDslDefinition
            ]
          } as ViewDslDefinition,
          {
            dslNodeType: DslDefinitionType.ELEMENT,
            widget: 'action-bar',
            slot: 'actionBar',
            subActionBar: true,
            widgets: []
          } as ElementDslDefinition & TemplateDslDefinition,
          {
            dslNodeType: DslDefinitionType.ELEMENT,
            widget: TABLE_WIDGET,
            slot: 'table',
            style: { height: '400px' },
            widgets: [
              {
                dslNodeType: DslDefinitionType.ELEMENT,
                widget: 'expand-column',
                slot: 'expandRow',
                widgets: []
              } as ElementDslDefinition,
              {
                dslNodeType: DslDefinitionType.SLOT,
                name: 'fields',
                widgets: []
              },
              {
                dslNodeType: DslDefinitionType.ELEMENT,
                widget: 'action-column',
                slot: 'rowActions',
                widgets: []
              } as ElementDslDefinition
            ]
          } as ElementDslDefinition & TemplateDslDefinition
        ]
      } as ViewDslDefinition;
    case ViewType.Form:
      return {
        dslNodeType: DslDefinitionType.VIEW,
        type,
        widgets: [
          {
            dslNodeType: DslDefinitionType.ELEMENT,
            widget: FORM_WIDGET,
            slot: 'form',
            cols: 2,
            widgets: [
              {
                dslNodeType: DslDefinitionType.SLOT,
                name: 'fields',
                widgets: []
              }
            ]
          } as ElementDslDefinition & TemplateDslDefinition
        ]
      } as ViewDslDefinition;
    case ViewType.Detail:
      return {
        dslNodeType: DslDefinitionType.VIEW,
        type,
        widgets: [
          {
            dslNodeType: DslDefinitionType.ELEMENT,
            widget: DETAIL_WIDGET,
            slot: 'detail',
            cols: 2,
            widgets: [
              {
                dslNodeType: DslDefinitionType.SLOT,
                name: 'fields',
                widgets: []
              }
            ]
          } as ElementDslDefinition & TemplateDslDefinition
        ]
      } as ViewDslDefinition;
    default:
      throw new Error('Default create popup layout unsupported view type.');
  }
}

function createPopupFooterLayout(): ElementDslDefinition & TemplateDslDefinition {
  return {
    dslNodeType: DslDefinitionType.ELEMENT,
    widget: 'action-bar',
    slot: 'footer',
    widgets: []
  };
}

function createDefaultFooterActions(model: string): TemplateDslDefinition {
  return {
    dslNodeType: DslDefinitionType.TEMPLATE,
    slot: 'footer',
    widgets: [
      {
        dslNodeType: DslDefinitionType.ACTION,
        actionType: ActionType.Client,
        model,
        name: ModelDefaultActionName.$$internal_DialogCancel,
        label: translateValueByKey('取消'),
        type: ButtonType.default.toUpperCase(),
        widgets: []
      } as ActionDslDefinition,
      {
        dslNodeType: DslDefinitionType.ACTION,
        actionType: ActionType.Client,
        model,
        name: ModelDefaultActionName.$$internal_DialogSubmit,
        label: translateValueByKey('确定'),
        type: ButtonType.primary.toUpperCase(),
        widgets: []
      } as ActionDslDefinition
    ]
  };
}

export async function createPopupDslDefinition(
  popupViewDslNode: DslDefinition | undefined,
  currentViewDslNode: DslDefinition | null | undefined,
  action: RuntimeViewAction
): Promise<PopupDslDefinition | undefined> {
  let view: RuntimeView | undefined;
  let viewDslNode: DslDefinition | null | undefined = currentViewDslNode;
  const model = await ModelCache.get(action.model);
  const resModel = await ModelCache.get(action.resModel || action.model);
  if (!model || !resModel) {
    return undefined;
  }
  let useActionsAsFooter = true;
  if (viewDslNode) {
    let viewType: ViewType | undefined;
    if (DslDefinitionHelper.isView(viewDslNode)) {
      viewType = (viewDslNode as ViewDslDefinition).type;
    }
    if (!viewType) {
      viewType = action.resViewType;
    }
    view = {
      type: viewType?.toUpperCase() as ViewType,
      model: resModel.model,
      // popupView-的前缀供action内的弹窗视图做覆盖的SPI用 <action><template slot="default"><view type="FORM"></view></template></action>
      name: `popupView-${action.name}`,
      template: ''
    } as RuntimeView;
  } else if (action.actionType === ActionType.View) {
    let viewAction: RuntimeViewAction | undefined;
    if (action.sessionPath) {
      viewAction = await useSessionPath(action.sessionPath, () => ViewActionCache.get(model.model, action.name));
    } else {
      viewAction = await ViewActionCache.get(model.model, action.name);
    }
    if (viewAction) {
      useActionsAsFooter = !!viewAction.resViewName;
      const { name, dsl, type } = viewAction.resView || {};
      if (dsl) {
        view = {
          type: (type || viewAction.viewType)?.toUpperCase(),
          model: resModel.model,
          name
        } as RuntimeView;
        viewDslNode = resolveDslDefinition(dsl);
      }
    }
  }
  if (!view) {
    return undefined;
  }
  const viewType = view.type || action.resViewType;
  if (useActionsAsFooter) {
    Optional.ofNullable(viewType)
      .map((v) => [ViewType.Form, ViewType.Detail].includes(v!))
      .ifPresent((v) => {
        useActionsAsFooter = v;
      });
  }
  if (!viewDslNode) {
    // viewDslNode = new XMLTemplateParser().parser(view.template).root;
    console.error('view dsl definition not supported.');
    viewDslNode = UnknownDslDefinition;
  }

  const cloneViewDslNode = {
    name: view.name,
    ...viewDslNode,
    model: (viewDslNode as any).model || view.model,
    widgets: [...(viewDslNode.widgets || [])]
  } as DslDefinition;

  const viewSlots = DslSlotUtils.fetchSlotsBySlotNames(cloneViewDslNode as DslDefinition, [
    'actionBar',
    'actions',
    'header',
    'footer'
  ]);
  const popupSlots = DslSlotUtils.fetchSlotsBySlotNames(popupViewDslNode, ['header', 'footer']);
  if (!viewSlots.header && popupSlots.header) {
    viewSlots.header = popupSlots.header;
  }
  if (!viewSlots.footer && popupSlots.footer) {
    viewSlots.footer = popupSlots.footer;
  }
  const actionBar = viewSlots.actionBar || viewSlots.actions;
  if (useActionsAsFooter) {
    if (!viewSlots.footer && actionBar) {
      viewSlots.footer = {
        ...actionBar,
        dslNodeType: DslDefinitionType.TEMPLATE,
        slot: 'footer'
      };
    }
    deleteTemplateNode(cloneViewDslNode, ['actionBar', 'actions', 'header', 'footer']);
  } else {
    deleteTemplateNode(cloneViewDslNode, ['header', 'footer']);
  }

  const widgets: DslDefinition[] = [];
  const { header, default: defaultSlot } = viewSlots;
  let { footer } = viewSlots;
  if (header) {
    widgets.push(header);
  }
  if (defaultSlot) {
    const layoutOption = {
      viewType,
      module: action.resModule || resModel.module || action.module || model.moduleName,
      moduleName: action.resModuleName || resModel.moduleName || action.moduleName || model.moduleName,
      model: resModel.model,
      modelName: resModel.name,
      viewName: view?.name,
      inline: true,
      actionName: action.name,
      actionWidget: action.widget
    };
    let popupLayout = generatorLayout(layoutOption);
    if (!popupLayout) {
      popupLayout = createPopupDefaultLayout(viewType);
      debugConsole.log('使用弹出层默认layout', popupLayout);
    }
    popupViewDslNode = mergeLayoutToModal(
      (popupViewDslNode as TemplateDslDefinition) ||
        ({
          dslNodeType: DslDefinitionType.TEMPLATE,
          slot: DEFAULT_SLOT_NAME,
          width: viewDslNode.width
        } as unknown as TemplateDslDefinition),
      popupLayout
    );

    widgets.push({
      dslNodeType: DslDefinitionType.TEMPLATE,
      slot: DEFAULT_SLOT_NAME,
      widgets: [DslSlotUtils.mergeTemplateToLayout(popupLayout, cloneViewDslNode)]
    });
  }
  const footerLayout = createPopupFooterLayout();
  if (!footer) {
    footer = createDefaultFooterActions(view.model);
    viewSlots.footer = footer;
  }
  widgets.push({
    ...footer,
    widgets: [DslSlotUtils.mergeSlotsToLayout(footerLayout, footer, viewSlots)]
  });

  // dialog action module相关 action是空的，在这里为源头直接拿模型补齐
  return {
    model: model.model,
    modelName: model.name,
    resModel: resModel.model || model.model,
    resModelName: resModel.name || model.name,
    module: action.module || model.module,
    moduleName: action.moduleName || model.moduleName,
    resModule: action.resModule || resModel.module || action.module || model.module,
    resModuleName: action.resModuleName || resModel.moduleName || action.moduleName || model.moduleName,
    viewType,
    viewDslNode,
    dslDefinition: {
      dslNodeType: DslDefinitionType.TEMPLATE,
      slot: DEFAULT_SLOT_NAME,
      ...(popupViewDslNode || {}),
      title: popupViewDslNode?.title || action.label || action.displayName,
      widgets
    }
  };
}

function mergeLayoutToModal(modal: TemplateDslDefinition, layout: DslDefinition) {
  Object.entries(layout).forEach(([key, value]) => {
    if ([...IGNORED_TEMPLATE_DSL_KEYS, DEFAULT_CHILDREN_KEY].includes(key)) {
      return;
    }
    modal[key] = value;
  });
  return modal;
}

/**
 * 弹出层销毁回调
 * @param currentPopupKey 弹出层的ket
 * @param disposeEventHandler 销毁的回调
 * @param openEventHandler 打开的回调
 */
export function popupDisposeCallback(
  currentPopupKey: string,
  disposeEventHandler: DisposeEventHandler,
  openEventHandler?: OpenEventHandler
) {
  nextTick(() => {
    const innerOpenFn = (manager: PopupManager, instance: IPopupInstance) => {
      if (instance.key === currentPopupKey) {
        openEventHandler?.(manager, instance);
      }
    };
    const innerDisposeFn = (manager: PopupManager, instance: IPopupInstance, action?: RuntimeAction) => {
      if (instance.key === currentPopupKey) {
        disposeEventHandler?.(manager, instance, action);
      }
      openEventHandler && PopupManager.INSTANCE.clearOnOpen(innerOpenFn);
      PopupManager.INSTANCE.clearOnClose(innerDisposeFn);
    };

    PopupManager.INSTANCE.onClose(innerDisposeFn);
    if (openEventHandler) {
      PopupManager.INSTANCE.onOpen(innerOpenFn);
    }
  });
}
