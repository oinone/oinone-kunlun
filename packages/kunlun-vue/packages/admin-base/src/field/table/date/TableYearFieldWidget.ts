import { ModelFieldType, ViewType } from '@kunlun/meta';
import { defaultYearFormat, defaultYearValueFormat } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { BaseFieldWidget } from '../../../basic';
import { TableDateTimeFieldWidget } from './TableDateTimeFieldWidget';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: [ModelFieldType.Year]
  })
)
export class TableYearFieldWidget extends TableDateTimeFieldWidget {
  protected get defaultFormat() {
    return defaultYearFormat;
  }

  protected get valueFormat(): string {
    return defaultYearValueFormat;
  }

  protected hasDateFormat = false;

  protected hasTimeFormat = false;
}
