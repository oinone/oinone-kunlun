import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';

import { LayoutWidget, MobileViewWidget } from '../../layout';

import HeaderComponent from './Header.vue';

@SPI.ClassFactory(
  MobileViewWidget.Token({
    tagName: 'header'
  })
)
export class HeaderLayout extends LayoutWidget {
  @Widget.Provide()
  @Widget.Reactive()
  public style = {
    height: '54px'
  } as any;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(HeaderComponent);
    return this;
  }
}
