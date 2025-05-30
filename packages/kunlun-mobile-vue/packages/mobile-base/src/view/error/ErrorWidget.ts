import { SPI } from '@kunlun/spi';
import { MobileViewWidget } from '../../layout';
import DefaultError from './DefaultError.vue';

@SPI.ClassFactory(MobileViewWidget.Token({}))
export class ErrorWidget extends MobileViewWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(DefaultError);
    console.warn('not fund widget', config);
    return this;
  }
}
