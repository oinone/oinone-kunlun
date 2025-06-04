import { Constructor } from '@oinone/kunlun-shared';
import { getWidgetNotNull, RenderWidget, ViewWidget, VueWidget } from '@oinone/kunlun-vue-widget';
import { BaseMaskOptions, BaseMaskWidget, BaseMaskWidgetProps } from '../../../basic';
import { InternalMaskWidget } from '../typing';
import { DslDefinitionTypeProps } from './typing';

function createNormalItem(
  widgets: VueWidget[],
  parentHandle: string,
  props: BaseMaskWidgetProps,
  consumer: (parentWidget: VueWidget) => VueWidget
) {
  const parentWidget = getWidgetNotNull(parentHandle);
  const currentWidget = consumer(parentWidget);
  widgets.push(currentWidget);
  return currentWidget;
}

export function createMaskWidgetByDslNodeType(props: DslDefinitionTypeProps): RenderWidget | undefined {
  const { parentHandle, dslNodeType, widget } = props;
  let options: BaseMaskOptions;
  if (dslNodeType === InternalMaskWidget.Widget) {
    options = { dslNodeType };
  } else {
    options = { dslNodeType, widget };
  }
  let usingViewWidget = false;
  let constructor: Constructor<BaseMaskWidget> | Constructor<ViewWidget> | undefined = BaseMaskWidget.Selector(options);
  if (!constructor) {
    constructor = ViewWidget.Selector({
      tagName: dslNodeType,
      widget
    });
    if (constructor) {
      usingViewWidget = true;
    } else {
      return undefined;
    }
  }
  let widgetRef: VueWidget | undefined;
  const widgets: VueWidget[] = [];
  const widgetInstance = createNormalItem(widgets, parentHandle, props, (parentWidget) => {
    if (usingViewWidget) {
      widgetRef = parentWidget.createWidget(constructor as Constructor<ViewWidget>, undefined, {
        dslNode: props
      });
    } else {
      widgetRef = parentWidget.createWidget(constructor as Constructor<BaseMaskWidget>, undefined, props);
    }
    return widgetRef;
  });
  return {
    handle: widgetInstance.getHandle(),
    widget: widgetRef!,
    widgets
  };
}
