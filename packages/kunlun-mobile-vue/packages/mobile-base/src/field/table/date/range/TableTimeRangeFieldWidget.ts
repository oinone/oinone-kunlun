import { ViewType } from '@oinone/kunlun-meta';
import { defaultTimeFormat, TimeFormatMap } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { BaseElementWidget } from '../../../../basic';
import { TableDateTimeRangeFieldWidget } from './TableDateTimeRangeFieldWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Table,
    widget: 'TimeRangePicker'
  })
)
export class TableTimeRangeFieldWidget extends TableDateTimeRangeFieldWidget {
  protected get defaultFormat() {
    return defaultTimeFormat;
  }

  protected get valueFormat(): string {
    return defaultTimeFormat;
  }

  protected hasDateFormat = false;

  protected convertTimeFormat(format: string): string | undefined {
    return TimeFormatMap.get(format);
  }
}
