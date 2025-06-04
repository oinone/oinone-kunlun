import { SPI } from '@oinone/kunlun-spi';
import { BaseMaskWidget, MaskWidget } from '../../basic';
import DividerComponent from './Divider.vue';

@SPI.ClassFactory(MaskWidget.Token({ widget: 'divider' }))
export class DividerWidget extends BaseMaskWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DividerComponent);
    return this;
  }
}
