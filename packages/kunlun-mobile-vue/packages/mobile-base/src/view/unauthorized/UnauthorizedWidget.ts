import { SPI } from '@oinone/kunlun-spi';
import { BaseRouterWidget } from '@oinone/kunlun-vue-router';
import Unauthorized from './Unauthorized.vue';

@SPI.ClassFactory(BaseRouterWidget.Token({ widget: 'MobileUnauthorizedWidget' }))
export class MobileUnauthorizedWidget extends BaseRouterWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Unauthorized);
    return this;
  }
}
