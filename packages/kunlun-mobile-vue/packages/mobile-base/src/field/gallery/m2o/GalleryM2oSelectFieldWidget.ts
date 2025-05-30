import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';

import { FormFieldWidget } from '../../../basic/field';
import Select from './Select.vue';
import { DetailM2oSelectFieldWidget } from '../../detail';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: ModelFieldType.ManyToOne
  })
)
export class GalleryM2oSelectFieldWidget extends DetailM2oSelectFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Select);
    return this;
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}
