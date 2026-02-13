import { ViewType } from '@oinone/kunlun-meta';
import type { Constructor } from '@oinone/kunlun-shared';
import {
  SPI,
  SPIFactory,
  SPIMultiSelector,
  SPIOperator,
  type SPIOptions,
  type SPISingleSelector,
  type SPITokenFactory
} from '@oinone/kunlun-spi';
import { type ActiveRecordsWidgetProps, InnerWidgetType, Widget } from '@oinone/kunlun-vue-widget';
import { BaseRuntimePropertiesWidget } from '../common';

/**
 * Element组件注册可选项
 */
export interface BaseElementOptions extends SPIOptions {
  /**
   * 指定视图类型
   */
  viewType?: ViewType | ViewType[];
  /**
   * 指定组件名称或别称
   */
  widget?: string | string[];
  /**
   * 指定是否内敛组件
   */
  inline?: boolean;
  /**
   * 指定模型
   */
  model?: string | string[];
  /**
   * 指定视图名称
   */
  viewName?: string | string[];
}

export interface BaseElementWidgetProps extends ActiveRecordsWidgetProps {
  viewType?: ViewType;
}

@SPI.Base('Element', ['viewType', 'widget', 'inline', 'model', 'viewName'])
export class BaseElementWidget<
  Props extends BaseElementWidgetProps = BaseElementWidgetProps
> extends BaseRuntimePropertiesWidget<Props> {
  protected $$innerWidgetType = InnerWidgetType.Element;

  public static Token: SPITokenFactory<BaseElementOptions>;

  public static Selector: SPISingleSelector<BaseElementOptions, Constructor<BaseElementWidget>>;

  @Widget.Reactive()
  @Widget.Inject('viewType')
  protected parentViewType: ViewType | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected get viewType(): ViewType | undefined {
    return this.view?.type || this.parentViewType;
  }

  @Widget.Method()
  protected createHookWidgets(slots: string | string[]) {
    if (!this.renderProps) {
      return;
    }
    let finalSlots: string[];
    if (Array.isArray(slots)) {
      finalSlots = slots;
    } else {
      finalSlots = [slots];
    }
    for (const slot of finalSlots) {
      const { viewType, widget, inline } = this.renderProps as BaseElementOptions;
      const options: BaseElementHookOptions = {
        viewType,
        widget,
        inline,
        slot
      };
      BaseElementHookWidget.Selector(options).forEach((v) => this.createWidget(v, slot, this.renderProps));
    }
  }
}

export interface BaseElementHookOptions extends BaseElementOptions {
  slot: string;
}

export interface BaseElementHookWidgetProps extends BaseElementWidgetProps {
  slot: string;
}

@SPIFactory.Storage(['viewType', 'widget', 'inline', 'model', 'viewName', 'slot'], {
  selector: (storageKey): SPIMultiSelector<BaseElementHookOptions> => {
    return (options: BaseElementHookOptions) => {
      return SPIOperator.selectors(storageKey, options);
    };
  }
})
export class BaseElementHookWidget<
  Props extends BaseElementHookWidgetProps = BaseElementHookWidgetProps
> extends BaseRuntimePropertiesWidget<Props> {
  public static Token: SPITokenFactory<BaseElementHookOptions>;

  public static Selector: SPIMultiSelector<BaseElementHookOptions, Constructor<BaseElementHookWidget>>;

  public initialize(props: Props) {
    super.initialize(props);
    this.hookSlot = props.slot;
    return this;
  }

  @Widget.Reactive()
  protected hookSlot: string | undefined;

  @Widget.Reactive()
  @Widget.Inject('viewType')
  protected parentViewType: ViewType | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected get viewType(): ViewType | undefined {
    return this.view?.type || this.parentViewType;
  }
}
