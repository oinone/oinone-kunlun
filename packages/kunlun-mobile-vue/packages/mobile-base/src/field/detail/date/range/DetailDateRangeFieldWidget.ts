import { ViewType } from '@kunlun/meta';
import { DateFormatMap, defaultDateFormat } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../../basic';
import { DetailDateTimeRangeFieldWidget } from './DetailDateTimeRangeFieldWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Detail,
    widget: 'DateRangePicker'
  })
)
export class DetailDateRangeFieldWidget extends DetailDateTimeRangeFieldWidget {
  protected get defaultFormat() {
    return defaultDateFormat;
  }

  @Widget.Reactive()
  protected get valueFormat(): string {
    return defaultDateFormat;
  }

  @Widget.Reactive()
  protected hasTimeFormat = false;

  @Widget.Method()
  protected convertFormat(format: string): string | undefined {
    return DateFormatMap.get(format);
  }
}
