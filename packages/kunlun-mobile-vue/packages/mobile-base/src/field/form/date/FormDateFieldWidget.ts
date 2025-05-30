import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget, WidgetComponent } from '@kunlun/vue-widget';
import { WidgetTrigger } from '@kunlun/vue-ui-common';

import { FormFieldWidget } from '../../../basic';
import DefaultDatePicker from './DefaultDatePicker.vue';
import { FormDateTimeFieldWidget } from './FormDateTimeFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Search, ViewType.Form],
    ttype: ModelFieldType.Date
  })
)
export class FormDateFieldWidget extends FormDateTimeFieldWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultDatePicker;
  }

  @Widget.Method()
  public change(v) {
    super.change(v);
    this.blur();
  }

  protected defaultConstructDataTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  protected defaultClearFieldsTrigger() {
    return [WidgetTrigger.CHANGE];
  }
}
