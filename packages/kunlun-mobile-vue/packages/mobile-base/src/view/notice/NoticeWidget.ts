import { BaseRouterWidget } from '@kunlun/vue-router';
import component from './notice.vue';
import { SPI } from '@kunlun/spi';

@SPI.ClassFactory(BaseRouterWidget.Token({ widget: 'Notice' }))
export class NoticePageWidget extends BaseRouterWidget {
  public initialize(config: Record<string, unknown> = {}) {
    super.initialize(config);
    this.setComponent(component);
    return this;
  }
}
