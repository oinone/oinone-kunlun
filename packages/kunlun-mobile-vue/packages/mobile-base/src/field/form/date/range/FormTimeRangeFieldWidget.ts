import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { WidgetComponent } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../../basic';
import DefaultTimeRangePicker from './DefaultTimeRangePicker.vue';
import { FormDateTimeRangeFieldWidget } from './FormDateTimeRangeFieldWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Form,
    widget: 'TimeRangePicker'
  })
)
export class FormTimeRangeFieldWidget extends FormDateTimeRangeFieldWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultTimeRangePicker;
  }
}
