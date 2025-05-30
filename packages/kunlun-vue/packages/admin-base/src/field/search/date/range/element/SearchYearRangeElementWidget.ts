import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { WidgetComponent } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../../../basic';
import DefaultYearRangePicker from '../../../../form/date/range/DefaultYearRangePicker.vue';
import { SearchDateTimeRangeElementWidget } from './SearchDateTimeRangeElementWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Search,
    widget: 'YearRangePicker'
  })
)
export class SearchYearRangeElementWidget extends SearchDateTimeRangeElementWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultYearRangePicker;
  }
}
