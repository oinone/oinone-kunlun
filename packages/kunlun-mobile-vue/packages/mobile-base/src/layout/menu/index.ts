import { VueWidget } from '@oinone/kunlun-vue-widget';
import { SPI } from '@oinone/kunlun-spi';

import MenuComponent from './Menu.vue';
import { MobileViewWidget } from '../basic';

@SPI.ClassFactory(
  MobileViewWidget.Token({
    widget: 'mobile-menu'
  })
)
export default class MenuWidget extends VueWidget {
  public initialize(): VueWidget {
    super.initialize();
    this.setComponent(MenuComponent);
    return this;
  }
}
