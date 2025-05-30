import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';

import { FormFieldWidget } from '../../../basic/field';
import { DetailCommonFieldWidget } from '../../detail';
import GalleryCommonField from './GalleryCommonField.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: [
      ModelFieldType.String,
      ModelFieldType.Text,
      ModelFieldType.Phone,
      ModelFieldType.Email,
      ModelFieldType.Related
    ]
  })
)
export class GalleryCommonFieldWidget extends DetailCommonFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryCommonField);
    return this;
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}
