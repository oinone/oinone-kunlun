import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { DetailColorPickerStringFieldWidget } from '../../../detail';
import DefaultColorPicker from './DefaultColorPicker.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Gallery,
    ttype: ModelFieldType.String,
    widget: 'ColorPicker'
  })
)
export class GalleryColorPickerStringFieldWidget extends DetailColorPickerStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultColorPicker);
    return this;
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}
