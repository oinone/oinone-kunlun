import { SPI } from '@oinone/kunlun-spi';

import { LayoutWidget, MobileViewWidget } from '../../layout';
import ContentComponent from './Content.vue';

@SPI.ClassFactory(
  MobileViewWidget.Token({
    tagName: 'content'
  })
)
export class ContentLayout extends LayoutWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ContentComponent);
    return this;
  }
}
