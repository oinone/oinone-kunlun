import { Constructor } from '@oinone/kunlun-shared';
import { SPI, SPIOptions, SPISingleSelector, SPITokenFactory } from '@oinone/kunlun-spi';
import { VueWidget } from '@oinone/kunlun-vue-widget';

/**
 * Router组件注册可选项
 */
export interface BaseRouterOptions extends SPIOptions {
  /**
   * 指定组件名称或别称
   */
  widget?: string | string[];
}

@SPI.Base('Router', ['widget'])
export class BaseRouterWidget extends VueWidget {
  public static Token: SPITokenFactory<BaseRouterOptions>;

  public static Selector: SPISingleSelector<BaseRouterOptions, Constructor<BaseRouterWidget>>;
}
