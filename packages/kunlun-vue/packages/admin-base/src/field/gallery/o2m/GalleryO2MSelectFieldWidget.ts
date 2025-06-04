import { ViewType, ModelFieldType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic/field';
import Select from './Select.vue';
import { DetailO2MSelectFieldWidget } from '../../detail';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: ModelFieldType.OneToMany
  })
)
export class GalleryO2MSelectFieldWidget extends DetailO2MSelectFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Select);
    return this;
  }

  @Widget.Reactive()
  protected get currentValueStr() {
    return this.currentValue.map((_c) => _c.label)?.join('，');
  }
}
