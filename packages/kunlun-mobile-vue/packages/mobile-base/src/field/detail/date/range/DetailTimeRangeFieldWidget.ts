import { ViewType } from '@kunlun/meta';
import { defaultTimeFormat, TimeFormatMap } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
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
