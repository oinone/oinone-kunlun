import { IResourceDateTimeFormat, queryResourceDateTimeFormat } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import {
  DateFormatMap,
  DateTimeFormatMap,
  defaultDateFormatKey,
  defaultTimeFormatKey,
  ObjectUtils,
  TimeFormatMap
} from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic';
import ReadonlyDateTimePicker from './ReadonlyDateTimePicker.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: ModelFieldType.DateTime
  })
)
export class DetailDateTimeFieldWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ReadonlyDateTimePicker);
    return this;
  }

  @Widget.Reactive()
  protected resourceDateTimeFormat = {} as IResourceDateTimeFormat;

  @Widget.Reactive()
  protected get format(): string | undefined {
    return this.getDsl().format;
  }

  @Widget.Reactive()
  protected get valueFormat() {
    return this.getDsl().valueFormat;
  }

  @Widget.Reactive()
  protected get dateFormat(): string | undefined {
    let dateFormat = this.executeExpression<string>(this.getDsl().dateFormat);
    if (!dateFormat) {
      dateFormat = defaultDateFormatKey;
    }
    return (
      ObjectUtils.toUpperSnakeCase(this.resourceDateTimeFormat.resourceDateFormat as unknown as Record<string, string>)[
        dateFormat
      ] || dateFormat
    );
  }

  @Widget.Reactive()
  protected get timeFormat(): string | undefined {
    let timeFormat = this.executeExpression<string>(this.getDsl().timeFormat);
    if (!timeFormat) {
      timeFormat = defaultTimeFormatKey;
    }
    return (
      ObjectUtils.toUpperSnakeCase(this.resourceDateTimeFormat.resourceTimeFormat as unknown as Record<string, string>)[
        timeFormat
      ] || timeFormat
    );
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
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }

  protected async $$created() {
    super.$$created();
    this.resourceDateTimeFormat = await queryResourceDateTimeFormat();
  }
}
