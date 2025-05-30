import { SPI } from '@kunlun/spi';
import { ViewWidget, VueWidget } from '@kunlun/vue-widget';
import DefaultError from './DefaultError.vue';

@SPI.ClassFactory(ViewWidget.Token({}))
export class ErrorWidget extends VueWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(DefaultError);
    return this;
  }
}
