import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';

import { FormFieldWidget } from '../../../../basic';
import DefaultColorPicker from './DefaultColorPicker.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: ModelFieldType.String,
    widget: 'ColorPicker'
  })
)
export class DetailStringColorPickerFieldWidget extends FormFieldWidget {
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

/**
 * @deprecated please using DetailStringColorPickerFieldWidget
 */
export const DetailColorPickerStringFieldWidget = DetailStringColorPickerFieldWidget;
