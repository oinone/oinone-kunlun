import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import { DetailBooleanSelectFieldWidget } from '../../detail';
import GalleryEnum from '../enum/GalleryEnum.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: [ModelFieldType.Boolean],
    widget: ['Select', 'Radio']
  })
)
export class GalleryBooleanSelectFieldWidget extends DetailBooleanSelectFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryEnum);
    return this;
  }
}

/**
 * @deprecated please using GalleryBooleanSelectFieldWidget
 */
export const GalleryBoolEnumOptionFieldWidget = GalleryBooleanSelectFieldWidget;
