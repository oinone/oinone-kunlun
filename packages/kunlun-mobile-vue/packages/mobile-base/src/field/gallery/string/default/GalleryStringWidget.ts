import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';

import GalleryString from './GalleryString.vue';
import { FormFieldWidget } from '../../../../basic';
import { DetailStringWidget } from '../../../detail';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: [ModelFieldType.String, ModelFieldType.Phone, ModelFieldType.Email]
  })
)
export class GalleryStringWidget extends DetailStringWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryString);
    return this;
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}
