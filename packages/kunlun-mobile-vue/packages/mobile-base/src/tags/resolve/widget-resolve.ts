import { isDev } from '@kunlun/router';
import { CastHelper } from '@kunlun/shared';
import { RenderWidget } from '@kunlun/vue-widget';
import { unref } from 'vue';
import { defaultMetaContext } from '../context';
import {
  createActionColumnWidget,
  createActionWidget,
  createColWidget,
  createCommonCustomWidget,
  createContainerWidget,
  createElementWidget,
  createFieldWidget,
  createPackWidget,
  createViewWidget
} from './internal';
import { CustomWidgetProps, InternalWidget } from './typing';

export type CreateCustomWidgetFunction<T extends CustomWidgetProps = CustomWidgetProps> = (
  props: T
) => RenderWidget | undefined;

export function createCustomWidget(widget: string, props: CustomWidgetProps): RenderWidget | undefined {
  const fn = createCustomWidgetFunctionMap.get(widget);
  if (!fn) {
    console.error(`Invalid widget tag. value = ${widget}`);
    return undefined;
  }
  Object.keys(defaultMetaContext).forEach((key) => {
    const value = props[key];
    if (key in props) {
      props[key] = unref(value);
    }
  });
  if (props.automatic == null) {
    props.automatic = true;
  }
  return fn(props);
}

const createCustomWidgetFunctionMap = new Map<string, CreateCustomWidgetFunction>();

export function registerCustomWidgetFunction<T extends CustomWidgetProps = CustomWidgetProps>(
  widget: string,
  fn: CreateCustomWidgetFunction<T>
) {
  const isInternal = Object.values(InternalWidget).findIndex((v) => v === widget) !== -1;
  if (isInternal) {
    if (isDev()) {
      console.warn(`The widget name is internal widget. value = ${widget}`);
    }
    return;
  }
  createCustomWidgetFunctionMap.set(widget, CastHelper.cast(fn));
}

function registerInternalWidgetFunction<T extends CustomWidgetProps = CustomWidgetProps>(
  widget: string,
  fn: CreateCustomWidgetFunction<T>
) {
  createCustomWidgetFunctionMap.set(widget, CastHelper.cast(fn));
}

// View tag
registerInternalWidgetFunction(InternalWidget.View, createViewWidget);

// Field tag
registerInternalWidgetFunction(InternalWidget.Field, createFieldWidget);

// Action tag
registerInternalWidgetFunction(InternalWidget.Action, createActionWidget);

// Element tag
registerInternalWidgetFunction(InternalWidget.Element, createElementWidget);

registerInternalWidgetFunction(InternalWidget.ActionBar, createElementWidget);
registerInternalWidgetFunction(InternalWidget.Dropdown, createElementWidget);
registerInternalWidgetFunction(InternalWidget.DateTimeRangePicker, createElementWidget);
registerInternalWidgetFunction(InternalWidget.DateRangePicker, createElementWidget);
registerInternalWidgetFunction(InternalWidget.TimeRangePicker, createElementWidget);
registerInternalWidgetFunction(InternalWidget.YearRangePicker, createElementWidget);
registerInternalWidgetFunction(InternalWidget.Card, createElementWidget);
registerInternalWidgetFunction(InternalWidget.CardCascader, createElementWidget);
registerInternalWidgetFunction(InternalWidget.Tree, createElementWidget);
registerInternalWidgetFunction(InternalWidget.Search, createElementWidget);
registerInternalWidgetFunction(InternalWidget.Table, createElementWidget);

registerInternalWidgetFunction(InternalWidget.TextInfo, createElementWidget);
registerInternalWidgetFunction(InternalWidget.Paragraph, createElementWidget);
registerInternalWidgetFunction(InternalWidget.Picture, createElementWidget);
registerInternalWidgetFunction(InternalWidget.Icon, createElementWidget);

// Pack tag
registerInternalWidgetFunction(InternalWidget.Pack, createPackWidget);

registerInternalWidgetFunction(InternalWidget.Group, createPackWidget);
registerInternalWidgetFunction(InternalWidget.Row, createPackWidget);
registerInternalWidgetFunction(InternalWidget.Col, createColWidget);
registerInternalWidgetFunction(InternalWidget.Tabs, createPackWidget);
registerInternalWidgetFunction(InternalWidget.Containers, createPackWidget);
registerInternalWidgetFunction(InternalWidget.Container, createContainerWidget);
registerInternalWidgetFunction(InternalWidget.Block, createPackWidget);

registerInternalWidgetFunction(InternalWidget.ActionColumn, createActionColumnWidget);
registerInternalWidgetFunction(InternalWidget.RowActions, createActionColumnWidget);

// Custom tag
registerInternalWidgetFunction(InternalWidget.Custom, createCommonCustomWidget);
