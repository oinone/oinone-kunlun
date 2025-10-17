import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../basic';
import DefaultFullScreenControl from './DefaultFullScreenControl.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: 'FullScreenControl'
  })
)
export class FullScreenControlWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultFullScreenControl);
    return this;
  }
}
