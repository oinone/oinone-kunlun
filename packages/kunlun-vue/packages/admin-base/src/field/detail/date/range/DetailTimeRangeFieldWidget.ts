import { ViewType } from '@oinone/kunlun-meta';
import { defaultTimeFormat, TimeFormatMap } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../../basic';
import { DetailDateTimeRangeFieldWidget } from './DetailDateTimeRangeFieldWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Detail,
    widget: 'TimeRangePicker'
  })
)
export class DetailTimeRangeFieldWidget extends DetailDateTimeRangeFieldWidget {
  protected get defaultFormat() {
    return defaultTimeFormat;
  }

  @Widget.Reactive()
  protected get valueFormat(): string {
    return defaultTimeFormat;
  }

  @Widget.Reactive()
  protected hasDateFormat = false;

  @Widget.Method()
  protected convertFormat(format: string): string | undefined {
    return TimeFormatMap.get(format);
  }
}
