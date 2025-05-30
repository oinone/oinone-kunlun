import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { WidgetComponent } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../../../basic';
import DefaultDateRangePicker from '../../../../form/date/range/DefaultDateRangePicker.vue';
import { SearchDateTimeRangeElementWidget } from './SearchDateTimeRangeElementWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Search,
    widget: 'DateRangePicker'
  })
)
export class SearchDateRangeElementWidget extends SearchDateTimeRangeElementWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultDateRangePicker;
  }
}
