import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { defaultTimeFormat, TimeFormatMap } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget } from '../../../basic';
import { TableDateTimeFieldWidget } from './TableDateTimeFieldWidget';

@SPI.ClassFactory(BaseFieldWidget.Token({ viewType: ViewType.Table, ttype: [ModelFieldType.Time] }))
export class TableTimeFieldWidget extends TableDateTimeFieldWidget {
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

  protected getDateFormat(context): string | undefined {
    return undefined;
  }

  protected getDefaultDateFormat() {
    return undefined;
  }
}
