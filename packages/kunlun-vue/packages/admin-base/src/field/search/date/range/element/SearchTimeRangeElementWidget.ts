import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { WidgetComponent } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../../../basic';
import DefaultTimeRangePicker from '../../../../form/date/range/DefaultTimeRangePicker.vue';
import { SearchDateTimeRangeElementWidget } from './SearchDateTimeRangeElementWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Search,
    widget: 'TimeRangePicker'
  })
)
export class SearchTimeRangeElementWidget extends SearchDateTimeRangeElementWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultTimeRangePicker;
  }
}
