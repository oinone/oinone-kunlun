import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { DetailMultiEnumFieldWidget } from '../../../detail';
import GalleryTag from '../../string/tag/GalleryTag.vue';

@SPI.ClassFactory(FormFieldWidget.Token({ viewType: [ViewType.Gallery], ttype: ModelFieldType.Enum, multi: true }))
export class GalleryMultiEnumWidget extends DetailMultiEnumFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryTag);
    return this;
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}
