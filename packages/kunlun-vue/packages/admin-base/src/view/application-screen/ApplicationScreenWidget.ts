import { SPI } from '@oinone/kunlun-spi';
import { BaseElementWidget } from '../../basic';
import ApplicationScreenComponent from './ApplicationScreen.vue';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'ApplicationScreenWidget' }))
export class ApplicationScreenWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ApplicationScreenComponent);
    return this;
  }
}
