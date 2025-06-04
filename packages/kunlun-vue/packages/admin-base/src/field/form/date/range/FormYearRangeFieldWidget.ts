import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { WidgetComponent } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../../basic';
import DefaultYearRangePicker from './DefaultYearRangePicker.vue';
import { FormDateTimeRangeFieldWidget } from './FormDateTimeRangeFieldWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Form,
    widget: 'YearRangePicker'
  })
)
export class FormYearRangeFieldWidget extends FormDateTimeRangeFieldWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultYearRangePicker;
  }
}
