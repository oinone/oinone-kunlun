import { CastHelper } from '@oinone/kunlun-shared';
import { RenderWidget } from '@oinone/kunlun-vue-widget';
import { unref } from 'vue';
import { BaseMaskWidgetProps } from '../../basic';
import { defaultMaskContext } from '../context';
import { createMaskWidgetByDslNodeType } from './internal';
import { InternalMaskWidget } from './typing';

export type CreateMaskWidgetFunction<T extends BaseMaskWidgetProps = BaseMaskWidgetProps> = (
  props: T
) => RenderWidget | undefined;

export function createMaskWidget(tag: string, props: BaseMaskWidgetProps): RenderWidget | undefined {
  const fn = createMaskWidgetFunctionMap.get(tag);
  if (!fn) {
    console.error(`Invalid mask tag. value = ${tag}`);
    return undefined;
  }
  Object.keys(defaultMaskContext).forEach((key) => {
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

const createMaskWidgetFunctionMap = new Map<string, CreateMaskWidgetFunction>();

export function registerMaskWidgetFunction<T extends BaseMaskWidgetProps = BaseMaskWidgetProps>(
  tag: string,
  fn?: CreateMaskWidgetFunction<T>
): boolean {
  const isInternal = Object.values(InternalMaskWidget).findIndex((v) => v === tag) !== -1;
  if (isInternal) {
    console.warn(`The widget name is internal widget. value = ${tag}`);
    return false;
  }
  createMaskWidgetFunctionMap.set(tag, CastHelper.cast(fn || createMaskWidgetByDslNodeType));
  return true;
}

function registerInternalWidgetFunction<T extends BaseMaskWidgetProps = BaseMaskWidgetProps>(
  widget: string,
  fn: CreateMaskWidgetFunction<T>
) {
  createMaskWidgetFunctionMap.set(widget, CastHelper.cast(fn));
}

registerInternalWidgetFunction(InternalMaskWidget.Mask, createMaskWidgetByDslNodeType);

registerInternalWidgetFunction(InternalMaskWidget.Widget, createMaskWidgetByDslNodeType);

registerInternalWidgetFunction(InternalMaskWidget.Header, createMaskWidgetByDslNodeType);
registerInternalWidgetFunction(InternalMaskWidget.Container, createMaskWidgetByDslNodeType);
registerInternalWidgetFunction(InternalMaskWidget.Content, createMaskWidgetByDslNodeType);
registerInternalWidgetFunction(InternalMaskWidget.Block, createMaskWidgetByDslNodeType);

registerInternalWidgetFunction(InternalMaskWidget.Sidebar, createMaskWidgetByDslNodeType);
registerInternalWidgetFunction(InternalMaskWidget.Breadcrumb, createMaskWidgetByDslNodeType);
registerInternalWidgetFunction(InternalMaskWidget.MultiTabs, createMaskWidgetByDslNodeType);
