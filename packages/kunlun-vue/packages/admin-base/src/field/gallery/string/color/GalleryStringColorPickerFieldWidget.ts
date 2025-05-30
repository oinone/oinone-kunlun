import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { DetailStringColorPickerFieldWidget } from '../../../detail';
import DefaultColorPicker from './DefaultColorPicker.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Gallery,
    ttype: ModelFieldType.String,
    widget: 'ColorPicker'
  })
)
export class GalleryStringColorPickerFieldWidget extends DetailStringColorPickerFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultColorPicker);
    return this;
  }
}

/**
 * @deprecated please using GalleryStringColorPickerFieldWidget
 */
export const GalleryColorPickerStringFieldWidget = GalleryStringColorPickerFieldWidget;
