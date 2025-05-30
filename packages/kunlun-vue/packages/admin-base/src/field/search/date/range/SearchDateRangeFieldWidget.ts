import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { WidgetComponent } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { SearchDateTimeRangeFieldWidget } from './SearchDateTimeRangeFieldWidget';
import DefaultDateRangePicker from './DefaultDateRangePicker.vue';

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
