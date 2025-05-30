import { DslDefinition } from '@kunlun/dsl';
import { Constructor, StringHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { Slots, VNode } from 'vue';
import { BaseMaskLayoutWidget } from '../BaseMaskLayoutWidget';
import { BaseMaskWidget, BaseMaskWidgetProps, MobileMaskWidget, MobileViewWidget } from '../basic';

export interface MaskCommonWidgetProps extends BaseMaskWidgetProps {
  widget: string;
}

@SPI.ClassFactory(MobileMaskWidget.Token({ dslNodeType: 'widget' }))
export class MaskCommonWidget extends BaseMaskLayoutWidget<MaskCommonWidgetProps> {
  protected widget: string | undefined;

  protected currentWidget: { name: string; widgetInstance: BaseMaskWidget | MobileViewWidget } | null | undefined;

  public initialize(props: MaskCommonWidgetProps) {
    if (props.slotNames == null) {
      props.slotNames = [];
    }
    super.initialize(props);
    this.widget = props.widget;
    this.createOrUpdateWidget(props);
    return this;
  }

  @Widget.Reactive()
  public get classNames(): string[] | undefined {
    return StringHelper.append(['k-m-layout-widget'], super.classNames);
  }

  protected createOrUpdateWidget(props: Record<string, unknown>) {
    const { widget, currentWidget } = this;
    if (!widget) {
      console.error('Invalid widget property', this);
      return;
    }
    if (widget === currentWidget?.name || currentWidget === null) {
      return;
    }

    currentWidget?.widgetInstance.dispose();
    this.currentWidget = undefined;

    let usingViewWidget = false;
    let constructor: Constructor<BaseMaskWidget> | Constructor<MobileViewWidget> | undefined = BaseMaskWidget.Selector({
      widget
    });
    if (!constructor) {
      constructor = MobileViewWidget.Selector({ widget });
      if (constructor) {
        usingViewWidget = true;
      } else {
        this.currentWidget = null;
        return;
      }
    }
    if (usingViewWidget) {
      this.currentWidget = {
        name: widget,
        widgetInstance: this.createWidget(constructor as Constructor<MobileViewWidget>, undefined, {
          dslNode: props
        })
      };
    } else {
      this.currentWidget = {
        name: widget,
        widgetInstance: this.createWidget(constructor as Constructor<BaseMaskWidget>, undefined, props)
      };
    }
  }

  public render(ctx?: Record<string, unknown>, slots?: Slots): VNode | VNode[] {
    this.widget = (ctx?.dslDefinition as DslDefinition)?.widget;
    this.createOrUpdateWidget(ctx || {});
    if (this.currentWidget) {
      const finalSlots = slots;
      slots = {
        default: () => {
          const children = this.currentWidget?.widgetInstance.render(ctx, finalSlots);
          if (children) {
            if (Array.isArray(children)) {
              return children;
            }
            return [children];
          }
          return [];
        }
      };
    }
    return super.render(ctx, slots);
  }
}
