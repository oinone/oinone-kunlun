import { ViewType, ModelFieldType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { Widget } from '@kunlun/vue-widget';
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
