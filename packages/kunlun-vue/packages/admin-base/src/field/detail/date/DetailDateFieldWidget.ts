import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { DateFormatMap, defaultDateFormat } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic';
import { DetailDateTimeFieldWidget } from './DetailDateTimeFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: ModelFieldType.Date
  })
)
export class DetailDateFieldWidget extends DetailDateTimeFieldWidget {
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
