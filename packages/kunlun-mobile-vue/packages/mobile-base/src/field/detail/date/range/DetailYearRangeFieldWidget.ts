import { ViewType } from '@oinone/kunlun-meta';
import { defaultYearFormat, defaultYearValueFormat } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
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
