import { SPI } from '@kunlun/spi';
import { MaskWidget } from '@kunlun/vue-admin-layout';
import { Widget } from '@kunlun/vue-widget';
import IFrameView from './IFrameView.vue';

@SPI.ClassFactory(MaskWidget.Token({ widget: 'IFrameViewWidget' }))
export class IFrameViewWidget extends MaskWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(IFrameView);
    return this;
  }

  @Widget.Reactive()
  private get frameUrl() {
    return this.getDsl().frameUrl || 'https://www.baidu.com';
  }

  @Widget.Reactive()
  private get showMenu() {
    return this.getDsl().showMenu || false;
  }
}
