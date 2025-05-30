import { ViewType } from '@kunlun/meta';
import { defaultYearFormat, defaultYearValueFormat } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../../basic';
import { DetailDateTimeRangeFieldWidget } from './DetailDateTimeRangeFieldWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Detail,
    widget: 'YearRangePicker'
  })
)
export class DetailYearRangeFieldWidget extends DetailDateTimeRangeFieldWidget {
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
