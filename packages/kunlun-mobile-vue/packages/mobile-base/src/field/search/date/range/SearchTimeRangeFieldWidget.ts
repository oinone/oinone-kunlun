import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { WidgetComponent } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import DefaultTimeRangePicker from './DefaultTimeRangePicker.vue';
import { SearchDateTimeRangeFieldWidget } from './SearchDateTimeRangeFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.Time
  })
)
export class SearchTimeRangeFieldWidget extends SearchDateTimeRangeFieldWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultTimeRangePicker;
  }
}
