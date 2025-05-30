import { ViewType } from '@kunlun/meta';
import { DateFormatMap, defaultDateFormat } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { BaseElementWidget } from '../../../../basic';
import { TableDateTimeRangeFieldWidget } from './TableDateTimeRangeFieldWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Table,
    widget: 'DateRangePicker'
  })
)
export class TableDateRangeFieldWidget extends TableDateTimeRangeFieldWidget {
  protected get defaultFormat() {
    return defaultDateFormat;
  }

  protected get valueFormat(): string {
    return defaultDateFormat;
  }

  protected hasTimeFormat = false;

  protected convertFormat(format: string): string | undefined {
    return DateFormatMap.get(format);
  }
}
