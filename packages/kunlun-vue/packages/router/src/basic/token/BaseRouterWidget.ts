import { Constructor } from '@kunlun/shared';
import { SPI, SPIOptions, SPISingleSelector, SPITokenFactory } from '@kunlun/spi';
import { VueWidget } from '@kunlun/vue-widget';

export interface BaseRouterOptions extends SPIOptions {
  widget?: string;
}

@SPI.Base('Router', ['widget'])
export class BaseRouterWidget extends VueWidget {
  public static Token: SPITokenFactory<BaseRouterOptions>;

  public static Selector: SPISingleSelector<BaseRouterOptions, Constructor<BaseRouterWidget>>;
}
