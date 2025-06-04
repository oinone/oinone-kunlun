import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { LayoutWidget, MobileViewWidget } from '../../layout';

import SidebarComponent from './Sidebar.vue';

@SPI.ClassFactory(
  MobileViewWidget.Token({
    tagName: 'sidebar'
  })
)
export class SidebarLayout extends LayoutWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(SidebarComponent);
    return this;
  }

  @Widget.Provide('mode')
  @Widget.Reactive()
  protected get mode() {
    const { mode: dslModel } = this.getDsl();

    if (['horizontal', 'inline'].includes(dslModel)) {
      return dslModel;
    }

    return 'inline';
  }
}
