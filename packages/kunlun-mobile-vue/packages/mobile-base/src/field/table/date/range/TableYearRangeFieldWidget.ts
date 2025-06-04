import { ViewType } from '@oinone/kunlun-meta';
import { defaultYearFormat, defaultYearValueFormat } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { BaseElementWidget } from '../../../../basic';
import { TableDateTimeRangeFieldWidget } from './TableDateTimeRangeFieldWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Table,
    widget: 'YearRangePicker'
  })
)
export class TableYearRangeFieldWidget extends TableDateTimeRangeFieldWidget {
  protected get defaultFormat() {
    return defaultYearFormat;
  }

  protected get valueFormat(): string {
    return defaultYearValueFormat;
  }

  protected hasDateFormat = false;

  protected hasTimeFormat = false;
}
