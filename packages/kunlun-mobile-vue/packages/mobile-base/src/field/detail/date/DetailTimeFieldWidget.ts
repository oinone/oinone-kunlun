import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { defaultTimeFormat, TimeFormatMap } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic';
import { DetailDateTimeFieldWidget } from './DetailDateTimeFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: ModelFieldType.Time
  })
)
export class DetailTimeFieldWidget extends DetailDateTimeFieldWidget {
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
