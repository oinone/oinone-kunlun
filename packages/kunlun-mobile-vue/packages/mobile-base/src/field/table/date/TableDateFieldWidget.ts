import { ModelFieldType, ViewType } from '@kunlun/meta';
import { DateFormatMap, defaultDateFormat } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { BaseFieldWidget } from '../../../basic';
import { TableDateTimeFieldWidget } from './TableDateTimeFieldWidget';

@SPI.ClassFactory(BaseFieldWidget.Token({ viewType: ViewType.Table, ttype: [ModelFieldType.Date] }))
export class TableDateFieldWidget extends TableDateTimeFieldWidget {
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

  protected getTimeFormat(context): string | undefined {
    return undefined;
  }

  protected getDefaultTimeFormat() {
    return undefined;
  }
}
