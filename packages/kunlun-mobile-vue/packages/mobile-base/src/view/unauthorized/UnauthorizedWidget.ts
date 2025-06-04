import { SPI } from '@oinone/kunlun-spi';
import { useMatched } from '@oinone/kunlun-router';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseRouterWidget } from '@oinone/kunlun-vue-router';
import Unauthorized from './Unauthorized.vue';

@SPI.ClassFactory(BaseRouterWidget.Token({ widget: 'MobileUnauthorizedWidget' }))
export class MobileUnauthorizedWidget extends BaseRouterWidget {
  public initialize(props?: any) {
    super.initialize(props);
    this.setComponent(Unauthorized);
    return this;
  }
}
