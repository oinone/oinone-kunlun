import { ModelFieldType, ViewType } from '@kunlun/meta';
import { DateFormatMap, defaultDateFormat } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
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
