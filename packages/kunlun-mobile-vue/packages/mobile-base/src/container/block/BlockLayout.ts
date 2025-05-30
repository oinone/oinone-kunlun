import { SPI } from '@kunlun/spi';
import { LayoutWidget, MobileViewWidget } from '../../layout';

import BlockComponent from './Block.vue';

@SPI.ClassFactory(
  MobileViewWidget.Token({
    tagName: 'block'
  })
)
export class BlockLayout extends LayoutWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(BlockComponent);
    return this;
  }
}
