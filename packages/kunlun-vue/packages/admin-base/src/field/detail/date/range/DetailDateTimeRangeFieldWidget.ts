import { ViewType } from '@kunlun/meta';
import { DateFormatMap, DateTimeFormatMap, defaultFormat, StandardString, TimeFormatMap } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../../basic';
import { FormRangeFieldsWidget } from '../../../range';
import ReadonlyDateTimeRangePicker from './ReadonlyDateTimeRangePicker.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Detail,
    widget: 'DateTimeRangePicker'
  })
)
export class DetailDateTimeRangeFieldWidget extends FormRangeFieldsWidget<StandardString> {
  protected get defaultFormat() {
    return defaultFormat;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(ReadonlyDateTimeRangePicker);
    return this;
  }

  @Widget.Reactive()
  protected get format(): string | undefined {
    return this.getDsl().format;
  }

  @Widget.Reactive()
  protected get valueFormat() {
    return defaultFormat;
  }

  @Widget.Reactive()
  protected get dateFormat(): string | undefined {
    return this.executeExpression(this.getDsl().dateFormat);
  }

  @Widget.Reactive()
  protected get timeFormat(): string | undefined {
    return this.executeExpression(this.getDsl().timeFormat);
  }

  @Widget.Reactive()
  protected hasDateFormat = true;

  @Widget.Reactive()
  protected hasTimeFormat = true;

  @Widget.Reactive()
  protected convertFormat(format: string): string | undefined {
    return DateTimeFormatMap.get(format);
  }

  @Widget.Reactive()
  protected convertDateFormat(format: string): string | undefined {
    return DateFormatMap.get(format);
  }

  @Widget.Reactive()
  protected convertTimeFormat(format: string): string | undefined {
    return TimeFormatMap.get(format);
  }

  @Widget.Reactive()
  protected get emptyStyle() {
    return this.getDsl().emptyStyle;
  }
}
