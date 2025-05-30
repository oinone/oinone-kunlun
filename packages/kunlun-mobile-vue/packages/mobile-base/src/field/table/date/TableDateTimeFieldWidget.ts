import { IResourceDateTimeFormat, queryResourceDateTimeFormat } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import {
  DateFormatMap,
  DateTimeFormatMap,
  DateUtil,
  defaultDateFormatKey,
  defaultFormat,
  defaultTimeFormatKey,
  ObjectUtils,
  TimeFormatMap
} from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { isNil } from 'lodash-es';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../basic';
import { RowContext } from '../../../ui';

@SPI.ClassFactory(BaseFieldWidget.Token({ viewType: ViewType.Table, ttype: [ModelFieldType.DateTime] }))
export class TableDateTimeFieldWidget extends BaseTableFieldWidget<string | Date> {
  @Widget.Method()
  public renderDefaultSlot(context) {
    const value = this.compute(context);
    let cv;
    if (isNil(value)) {
      cv = '';
    } else {
      const dateFormat = this.getDateFormat(context) || this.getDefaultDateFormat();
      const timeFormat = this.getTimeFormat(context) || this.getDefaultTimeFormat();

      const resourceDateFormat = ObjectUtils.toUpperSnakeCase(
        this.resourceDateTimeFormat.resourceDateFormat as unknown as Record<string, string>
      );
      const resourceTimeFormat = ObjectUtils.toUpperSnakeCase(
        this.resourceDateTimeFormat.resourceTimeFormat as unknown as Record<string, string>
      );

      const formatStr =
        this.format || [resourceDateFormat[dateFormat!], resourceTimeFormat[timeFormat!]].filter(Boolean).join(' ');

      let format = DateUtil.fetchDatetimeFormat(
        { hasDateFormat: this.hasDateFormat, hasTimeFormat: this.hasTimeFormat },
        formatStr,
        dateFormat,
        timeFormat,
        this.convertFormat,
        this.convertDateFormat,
        this.convertTimeFormat
      );
      if (!format) {
        format = this.defaultFormat;
      }
      const datetimeFormatValue = DateUtil.dateFormat(DateUtil.toDate(value, this.valueFormat), format);
      if (datetimeFormatValue) {
        cv = datetimeFormatValue;
      }
    }
    return cv;
  }

  @Widget.Reactive()
  protected resourceDateTimeFormat = {} as IResourceDateTimeFormat;

  protected get format(): string | undefined {
    return this.getDsl().format;
  }

  protected getDateFormat(context: RowContext): string | undefined {
    return this.executeExpression(context.data, this.getDsl().dateFormat);
  }

  protected getTimeFormat(context: RowContext): string | undefined {
    return this.executeExpression(context.data, this.getDsl().timeFormat);
  }

  protected getDefaultDateFormat(): string | undefined {
    return defaultDateFormatKey;
  }

  protected getDefaultTimeFormat(): string | undefined {
    return defaultTimeFormatKey;
  }

  protected get defaultFormat() {
    return defaultFormat;
  }

  protected get valueFormat() {
    return defaultFormat;
  }

  protected hasDateFormat = true;

  protected hasTimeFormat = true;

  protected convertFormat(format: string): string | undefined {
    return DateTimeFormatMap.get(format);
  }

  protected convertDateFormat(format: string): string | undefined {
    return DateFormatMap.get(format);
  }

  protected convertTimeFormat(format: string): string | undefined {
    return TimeFormatMap.get(format);
  }

  protected async $$created() {
    super.$$created();
    this.resourceDateTimeFormat = await queryResourceDateTimeFormat();
  }
}
