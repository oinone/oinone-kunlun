import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic';
import { DetailNumberWidget } from '../../detail';
import GalleryString from '../string/default/GalleryString.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Gallery,
    ttype: [ModelFieldType.Integer, ModelFieldType.Long, ModelFieldType.Float, ModelFieldType.Currency]
  })
)
export class GalleryNumberWidget extends DetailNumberWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryString);
    return this;
  }
}
