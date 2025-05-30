import { SPI } from '@kunlun/spi';

import { VueWidget } from '@kunlun/vue-widget';

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
