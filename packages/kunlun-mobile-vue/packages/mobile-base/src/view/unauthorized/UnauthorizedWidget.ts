import { SPI } from '@kunlun/spi';
import { useMatched } from '@kunlun/router';
import { Widget } from '@kunlun/vue-widget';
import { BaseRouterWidget } from '@kunlun/vue-router';
import Unauthorized from './Unauthorized.vue';

@SPI.ClassFactory(BaseRouterWidget.Token({ widget: 'MobileUnauthorizedWidget' }))
export class MobileUnauthorizedWidget extends BaseRouterWidget {
  public initialize(props?: any) {
    super.initialize(props);
    this.setComponent(Unauthorized);
    return this;
  }
}
