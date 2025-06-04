import { SPI } from '@oinone/kunlun-spi';

import { VueWidget } from '@oinone/kunlun-vue-widget';

export const ROOT_TOKEN = SPI.Token<Root>('Root token');

export class Root extends VueWidget {
  public static theRoot?: Root;

  public initialize(): Root {
    super.initialize();
    return this;
  }

  public constructor() {
    super();
    Root.theRoot = this;
  }
}
