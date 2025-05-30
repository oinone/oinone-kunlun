import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { DetailEnumFieldWidget } from '../../../detail';
import GalleryTag from '../../string/tag/GalleryTag.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Gallery,
    ttype: ModelFieldType.Enum
  })
)
export class GalleryEnumFieldWidget extends DetailEnumFieldWidget {
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

/**
 * @deprecated please using GalleryEnumFieldWidget
 */
export const GalleryEnumWidget = GalleryEnumFieldWidget;
