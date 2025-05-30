import { ViewType } from '@kunlun/meta';
import { Constructor } from '@kunlun/shared';
import { SPI, SPIOptions, SPISingleSelector, SPITokenFactory } from '@kunlun/spi';
import { ActiveRecordsWidgetProps, InnerWidgetType, Widget } from '@kunlun/vue-widget';
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
}
