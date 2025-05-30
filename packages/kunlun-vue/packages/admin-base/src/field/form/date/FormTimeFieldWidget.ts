import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { WidgetComponent } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../basic';
import DefaultTimePicker from './DefaultTimePicker.vue';
import { FormDateTimeFieldWidget } from './FormDateTimeFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Search, ViewType.Form],
    ttype: ModelFieldType.Time
  })
)
export class FormTimeFieldWidget extends FormDateTimeFieldWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultTimePicker;
  }
}
