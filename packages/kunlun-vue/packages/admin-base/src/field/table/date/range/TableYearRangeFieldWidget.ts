import { ViewType } from '@kunlun/meta';
import { defaultYearFormat, defaultYearValueFormat } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { isNumber, toString } from 'lodash-es';
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

  protected formatValue(value: Date | string | undefined, format: string) {
    if (isNumber(value)) {
      value = toString(value);
    }
    return super.formatValue(value, format);
  }
}
