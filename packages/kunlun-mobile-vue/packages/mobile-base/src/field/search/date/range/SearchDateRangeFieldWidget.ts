import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { WidgetComponent } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import DefaultDateRangePicker from './DefaultDateRangePicker.vue';
import { SearchDateTimeRangeFieldWidget } from './SearchDateTimeRangeFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.Date
  })
)
export class SearchDateRangeFieldWidget extends SearchDateTimeRangeFieldWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultDateRangePicker;
  }
}
