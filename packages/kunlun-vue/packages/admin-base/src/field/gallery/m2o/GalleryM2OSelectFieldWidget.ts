import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import { DetailM2OSelectFieldWidget } from '../../detail';
import Select from './Select.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: ModelFieldType.ManyToOne
  })
)
export class GalleryM2OSelectFieldWidget extends DetailM2OSelectFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Select);
    return this;
  }
}

/**
 * @deprecated please using GalleryM2OSelectFieldWidget
 */
export const GalleryM2oSelectFieldWidget = GalleryM2OSelectFieldWidget;
