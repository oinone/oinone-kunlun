import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { WidgetComponent } from '@oinone/kunlun-vue-widget';
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
