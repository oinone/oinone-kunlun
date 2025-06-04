import { SPI } from '@oinone/kunlun-spi';
import { LayoutWidget, MobileViewWidget } from '../../layout';

import ContainerComponent from './Container.vue';

@SPI.ClassFactory(
  MobileViewWidget.Token({
    tagName: 'container'
  })
)
export class ContainerLayout extends LayoutWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ContainerComponent);
    return this;
  }
}
