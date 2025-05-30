import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { WidgetComponent } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../../basic';
import DefaultDateRangePicker from './DefaultDateRangePicker.vue';
import { FormDateTimeRangeFieldWidget } from './FormDateTimeRangeFieldWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Form,
    widget: 'DateRangePicker'
  })
)
export class FormDateRangeFieldWidget extends FormDateTimeRangeFieldWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultDateRangePicker;
  }
}
