import { ViewType } from '@oinone/kunlun-meta';
import { DateFormatMap, defaultDateFormat } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
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
