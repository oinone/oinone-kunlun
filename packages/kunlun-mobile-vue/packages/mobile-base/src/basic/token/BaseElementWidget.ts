import { ViewType } from '@kunlun/meta';
import { Constructor } from '@kunlun/shared';
import { SPI, SPISingleSelector, SPITokenFactory } from '@kunlun/spi';
import { ActiveRecordsWidgetProps, InnerWidgetType, Widget } from '@kunlun/vue-widget';
import { BaseRuntimePropertiesWidget } from '../common';
import { MobileSPIOptions } from '../types';

export interface BaseElementOptions extends MobileSPIOptions {
  viewType?: ViewType | ViewType[];
  widget?: string | string[];
  inline?: boolean;
  model?: string | string[];
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

  public initialize(props: Props) {
    super.initialize(props);
    return this;
  }
}
