import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { WidgetTrigger } from '@oinone/kunlun-vue-ui-common';
import { Widget, WidgetComponent } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic';
import DefaultYearPicker from './DefaultYearPicker.vue';
import { FormDateTimeFieldWidget } from './FormDateTimeFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Search, ViewType.Form],
    ttype: ModelFieldType.Year
  })
)
export class FormYearFieldWidget extends FormDateTimeFieldWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultYearPicker;
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
