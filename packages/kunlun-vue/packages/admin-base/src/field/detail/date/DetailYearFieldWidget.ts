import { ModelFieldType, ViewType } from '@kunlun/meta';
import { defaultYearFormat, defaultYearValueFormat } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../basic';
import { DetailDateTimeFieldWidget } from './DetailDateTimeFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: ModelFieldType.Year
  })
)
export class DetailYearFieldWidget extends DetailDateTimeFieldWidget {
  protected get defaultFormat() {
    return defaultYearFormat;
  }

  @Widget.Reactive()
  protected get format(): string | undefined {
    return this.getDsl().format || this.defaultFormat;
  }

  @Widget.Reactive()
  protected get valueFormat(): string {
    return defaultYearValueFormat;
  }

  @Widget.Reactive()
  protected hasDateFormat = false;

  @Widget.Reactive()
  protected hasTimeFormat = false;
}
