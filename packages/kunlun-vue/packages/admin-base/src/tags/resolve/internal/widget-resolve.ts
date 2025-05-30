import {
  ColSpanEnum,
  getRealTtype,
  isRuntimeClientAction,
  RuntimeAction,
  RuntimeContextManager,
  RuntimeModelField,
  RuntimeViewAction
} from '@kunlun/engine';
import { IDslNode, ViewType } from '@kunlun/meta';
import { CastHelper, debugConsole, instantiate } from '@kunlun/shared';
import { getWidget, getWidgetNotNull, newVueWidget, RenderWidget, VueWidget } from '@kunlun/vue-widget';
import {
  BaseActionOptions,
  BaseActionWidget,
  BaseElementOptions,
  BaseElementWidget,
  BaseFieldOptions,
  BaseFieldWidget,
  BasePackOptions,
  BasePackWidget,
  BaseView,
  BaseViewOptions,
  CustomWidget as CommonCustomWidget
} from '../../../basic';
import { DefaultColWidget, DefaultContainerColWidget, DefaultRowWidget } from '../../../container';
import { FieldMixinComponentOptions, selectorFieldMixinComponent } from '../../../spi';
import { ActiveLayoutEffectOpt } from '../../context/active';
import { isCreateFlexElement } from '../helper';
import { CustomWidgetProps } from '../typing';
import { ActionWidgetProps, ElementWidgetProps, FieldWidgetProps, PackWidgetProps, ViewWidgetProps } from './typing';

export function createDefaultCol(rowWidget: DefaultRowWidget, props: PackWidgetProps) {
  return rowWidget.createWidget(new DefaultColWidget(rowWidget), props.slotName, {
    ...props,
    internal: true
  });
}

export function fetchRealParentWidget(
  widgets: VueWidget[],
  parentHandle: string,
  props: CustomWidgetProps,
  options?: {
    createDefaultCol: (rowWidget: DefaultRowWidget, props: CustomWidgetProps) => VueWidget;
  }
): { widget?: VueWidget; slotName?: string } {
  const root = getWidget(parentHandle);
  if (!root) {
    return {};
  }
  let parentWidget: VueWidget;
  let { slotName } = props;
  const resolveMode = props.resolveOptions?.mode;
  if (isCreateFlexElement(resolveMode) && root instanceof DefaultRowWidget) {
    parentWidget = (options?.createDefaultCol || createDefaultCol)(root, props);
    widgets.push(parentWidget);
    slotName = undefined;
  } else {
    parentWidget = root;
  }
  return { widget: parentWidget, slotName };
}

export function createFlexContainerItem(
  widgets: VueWidget[],
  parentHandle: string,
  props: CustomWidgetProps,
  consumer: (parentWidget: VueWidget, slotName: string | undefined) => VueWidget,
  options?: {
    fetchRealParentWidget?: (
      widgets: VueWidget[],
      parentHandle: string,
      props: CustomWidgetProps
    ) => { widget?: VueWidget; slotName?: string };
  }
) {
  const { widget: realParentWidget, slotName } = (options?.fetchRealParentWidget || fetchRealParentWidget)(
    widgets,
    parentHandle,
    props
  );
  let parentWidget: VueWidget;
  if (realParentWidget) {
    parentWidget = realParentWidget;
  } else {
    parentWidget = newVueWidget();
  }
  const currentWidget = consumer(parentWidget, slotName);
  widgets.push(currentWidget);
  return currentWidget;
}

export function createNormalItem(
  widgets: VueWidget[],
  parentHandle: string,
  props: CustomWidgetProps,
  consumer: (parentWidget: VueWidget) => VueWidget
) {
  const parentWidget = getWidgetNotNull(parentHandle);
  const currentWidget = consumer(parentWidget);
  widgets.push(currentWidget);
  return currentWidget;
}

export function createViewWidget(props: ViewWidgetProps): RenderWidget | undefined {
  const { parentHandle, viewType, type, widget } = props;
  const options: BaseViewOptions = {
    type: type || viewType,
    widget
  };
  const constructor = BaseView.Selector(options);
  if (!constructor) {
    console.error('Invalid view widget', options);
    return undefined;
  }
  let widgetRef: VueWidget | undefined;
  const widgets: VueWidget[] = [];
  const widgetInstance = createFlexContainerItem(
    widgets,
    parentHandle,
    props,
    (parentWidget, realParentHandle) =>
      (widgetRef = parentWidget.createWidget(constructor, realParentHandle, CastHelper.cast(props)))
  );
  return {
    handle: widgetInstance.getHandle(),
    widget: widgetRef!,
    widgets
  };
}

export function createFieldWidget(props: FieldWidgetProps): RenderWidget | undefined {
  const { rootHandle, parentHandle, widget, model, data, __metadata_index } = props;
  const rootContext = RuntimeContextManager.get(rootHandle);
  if (!rootContext) {
    console.error('context not initialized.', rootHandle);
    return undefined;
  }
  const { view, model: runtimeModel } = rootContext;
  let modelField: RuntimeModelField | undefined;
  if (model && data) {
    modelField = runtimeModel.modelFields.find((f) => f.data === data && f.__index === __metadata_index);
  }
  if (!modelField) {
    console.warn('runtime field not found.', runtimeModel, props);
    return undefined;
  }
  const { type: viewType, name: viewName } = view;
  let defaultColSpan: keyof typeof ColSpanEnum | number | undefined;
  if (viewType === ViewType.Search) {
    defaultColSpan = 'QUARTER';
  }
  const template = props.template;
  if (defaultColSpan && template && !('colSpan' in template) && !('span' in template)) {
    template.colSpan = defaultColSpan;
  }
  let widgetRef: BaseFieldWidget | undefined;
  const widgets: VueWidget[] = [];
  const { name, multi } = modelField;
  const realTtype = getRealTtype(modelField);
  const options: BaseFieldOptions = {
    viewType,
    ttype: realTtype,
    multi,
    widget,
    model: props.model || runtimeModel?.model,
    viewName,
    name
  };
  debugConsole.group(`SPI Field: ${modelField.model}:${modelField.name}:${modelField.label}`);
  const constructor = BaseFieldWidget.Selector(options);
  if (!constructor) {
    console.error('Invalid field widget', options);
    return undefined;
  }
  const widgetInstance = createFlexContainerItem(widgets, parentHandle, props, (parentWidget, realParentHandle) => {
    return (widgetRef = parentWidget.createWidget(constructor, realParentHandle, {
      ...props,
      viewType,
      field: modelField
    }));
  });
  if (widgetRef!.getMixinComponent() == null) {
    const mixinComponent = selectorFieldMixinComponent(options as FieldMixinComponentOptions);
    if (mixinComponent) {
      widgetRef!.setMixinComponent(mixinComponent);
    }
  }
  return {
    handle: widgetInstance.getHandle(),
    widget: widgetRef!,
    widgets
  };
}

export function createActionWidget(props: ActionWidgetProps): RenderWidget | undefined {
  const { rootHandle, parentHandle, model, name, widget, __metadata_index } = props;
  const context = RuntimeContextManager.get(rootHandle);
  if (!context) {
    return undefined;
  }
  const { view, model: runtimeModel } = context;
  let action: RuntimeAction = CastHelper.cast(props);
  if (model && name) {
    const metadataAction = runtimeModel.modelActions.find((f) => f.name === name && f.__index === __metadata_index);
    if (metadataAction) {
      action = metadataAction;
    }
  }
  const { type: viewType, name: viewName } = view;
  const options: BaseActionOptions = {
    viewType,
    viewName,
    actionType: action.actionType,
    model: action.model,
    name: action.name,
    target: (action as RuntimeViewAction).target,
    widget
  };
  debugConsole.group(`SPI Action: ${action.model}:${action.name}:${action.label}`);
  if (isRuntimeClientAction(action)) {
    const { fun } = action;
    debugConsole.log(`action fun: ${action.fun}`);
    if (fun) {
      /**
       * 如果是客户端动作，需要把action的name用fun替代
       *   因为前端注册的是name，后端元数据返回的是fun，会导致找不到对应的action
       */
      options.name = fun;
    }
  }
  const constructor = BaseActionWidget.Selector(options);
  if (!constructor) {
    console.error('Invalid action widget', options);
    return undefined;
  }
  let widgetRef: VueWidget | undefined;
  const widgets: VueWidget[] = [];
  const widgetInstance = createFlexContainerItem(
    widgets,
    parentHandle,
    props,
    (parentWidget, realParentHandle) =>
      (widgetRef = parentWidget.createWidget(constructor, realParentHandle, {
        ...props,
        viewType,
        action
      }))
  );
  return {
    handle: widgetInstance.getHandle(),
    widget: widgetRef!,
    widgets
  };
}

export function createPackWidget(props: PackWidgetProps): RenderWidget | undefined {
  const { parentHandle, viewType, widget, inline } = props;
  const opt = ActiveLayoutEffectOpt.getOption();
  const options: BasePackOptions = {
    viewType,
    widget,
    inline,
    model: opt?.model,
    viewName: opt?.viewName
  };
  const constructor = BasePackWidget.Selector(options);

  if (!constructor) {
    console.error('Invalid pack widget', options);
    return undefined;
  }
  let widgetRef: VueWidget | undefined;
  const widgets: VueWidget[] = [];
  const widgetInstance = createFlexContainerItem(
    widgets,
    parentHandle,
    props,
    (parentWidget, realParentHandle) => (widgetRef = parentWidget.createWidget(constructor, realParentHandle, props))
  );
  return {
    handle: widgetInstance.getHandle(),
    widget: widgetRef!,
    widgets
  };
}

export function createElementWidget(props: ElementWidgetProps): RenderWidget | undefined {
  const opt = ActiveLayoutEffectOpt.getOption();

  const { parentHandle, viewType, widget, inline } = props;
  const options: BaseElementOptions = {
    viewType,
    widget,
    inline,
    model: opt?.model,
    viewName: opt?.viewName
  };
  const constructor = BaseElementWidget.Selector(options);
  if (!constructor) {
    console.error('Invalid element widget', options);
    return undefined;
  }
  let widgetRef: VueWidget | undefined;
  const widgets: VueWidget[] = [];
  const widgetInstance = createFlexContainerItem(
    widgets,
    parentHandle,
    props,
    (parentWidget, realParentHandle) => (widgetRef = parentWidget.createWidget(constructor, realParentHandle, props))
  );
  return {
    handle: widgetInstance.getHandle(),
    widget: widgetRef!,
    widgets
  };
}

export function createActionColumnWidget(props: CustomWidgetProps): RenderWidget | undefined {
  const { parentHandle, viewType, slotName, inline } = props;
  let widgetRef: VueWidget | undefined;
  const widgets: VueWidget[] = [];

  const opt = ActiveLayoutEffectOpt.getOption();

  const options: BaseElementOptions = {
    viewType,
    widget: 'TableOperationColumnWidget',
    inline,
    model: opt?.model,
    viewName: opt?.viewName
  };

  const constructor = BaseElementWidget.Selector(options);
  if (!constructor) {
    console.error('Invalid table operation column widget', options);
    return undefined;
  }
  const tableOperationColumnInstance = instantiate(constructor);
  const widgetInstance = createNormalItem(
    widgets,
    parentHandle,
    props,
    (parentWidget) =>
      (widgetRef = parentWidget.createWidget(tableOperationColumnInstance, slotName, {
        ...props,
        dslNode: CastHelper.cast<IDslNode>(props)
      }))
  );
  return {
    handle: widgetInstance.getHandle(),
    widget: widgetRef!,
    widgets
  };
}

export function createColWidget(props: PackWidgetProps): RenderWidget | undefined {
  const { parentHandle, viewType, widget, inline } = props;
  const rowWidget = getWidgetNotNull(parentHandle);
  if (!(rowWidget instanceof DefaultRowWidget)) {
    console.warn(`The parent component of col component must be row component.`, rowWidget);
    return undefined;
  }
  const options: BasePackOptions = {
    viewType,
    widget: widget || 'col',
    inline
  };
  const constructor = BasePackWidget.Selector(options);
  if (!constructor) {
    console.error('Invalid col widget', options);
    return undefined;
  }
  const colInstance = instantiate(constructor, rowWidget);
  const widgets: VueWidget[] = [];
  const widgetInstance = rowWidget.createWidget(colInstance, undefined, props);
  const widgetRef = widgetInstance;
  widgets.push(widgetInstance);
  return {
    handle: widgetInstance.getHandle(),
    widget: widgetRef,
    widgets
  };
}

export function createContainerWidget(props: PackWidgetProps): RenderWidget | undefined {
  const { parentHandle, viewType, widget, inline } = props;
  const options: BasePackOptions = {
    viewType,
    widget: widget || 'container',
    inline
  };
  const constructor = BasePackWidget.Selector(options);
  if (!constructor) {
    console.error('Invalid container widget', options);
    return undefined;
  }
  let widgetRef: VueWidget | undefined;
  const widgets: VueWidget[] = [];
  const widgetInstance = createFlexContainerItem(
    widgets,
    parentHandle,
    props,
    (parentWidget, realParentHandle) => (widgetRef = parentWidget.createWidget(constructor, realParentHandle, props)),
    {
      fetchRealParentWidget: (_, realParentHandle: string) => {
        return fetchRealParentWidget(widgets, realParentHandle, props, {
          createDefaultCol: (rowWidget: DefaultRowWidget) => {
            return rowWidget.createWidget(new DefaultContainerColWidget(rowWidget), undefined, {
              ...props,
              internal: true
            });
          }
        });
      }
    }
  );
  return {
    handle: widgetInstance.getHandle(),
    widget: widgetRef!,
    widgets
  };
}

export function createCommonCustomWidget(props: ElementWidgetProps): RenderWidget | undefined {
  const { rootHandle, parentHandle, viewType, widget, inline } = props;
  const options: BaseElementOptions = {
    viewType: viewType || RuntimeContextManager.get(rootHandle)?.view.type,
    widget,
    inline
  };
  const constructor = CommonCustomWidget.Selector(options);
  if (!constructor) {
    console.error('Invalid custom widget', options);
    return undefined;
  }
  let widgetRef: VueWidget | undefined;
  const widgets: VueWidget[] = [];
  const widgetInstance = createFlexContainerItem(
    widgets,
    parentHandle,
    props,
    (parentWidget, realParentHandle) => (widgetRef = parentWidget.createWidget(constructor, realParentHandle, props))
  );
  return {
    handle: widgetInstance.getHandle(),
    widget: widgetRef!,
    widgets
  };
}
