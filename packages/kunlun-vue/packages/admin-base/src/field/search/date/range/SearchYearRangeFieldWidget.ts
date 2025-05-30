import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { WidgetComponent } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import DefaultYearRangePicker from './DefaultYearRangePicker.vue';
import { SearchDateTimeRangeFieldWidget } from './SearchDateTimeRangeFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.Year
  })
)
export class SearchYearRangeFieldWidget extends SearchDateTimeRangeFieldWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultYearRangePicker;
  }
}
