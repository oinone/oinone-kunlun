import { RuntimeModelField } from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import { isDev } from '@oinone/kunlun-router';
import { DateFormatMap, DateTimeFormatMap, DateUtil, defaultFormat, TimeFormatMap } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { RowContext } from '../../../../ui';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isDate, isEmpty, isString, toString } from 'lodash-es';
import { VNode } from 'vue';
import { BaseElementWidget, BaseTableColumnWidget } from '../../../../basic';
import { findRangeFields } from '../../../util';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Table,
    widget: 'DateTimeRangePicker'
  })
)
export class TableDateTimeRangeFieldWidget extends BaseTableColumnWidget {
  @Widget.Reactive()
  protected startField!: RuntimeModelField;

  @Widget.Reactive()
  protected endField!: RuntimeModelField;

  @Widget.Reactive()
  public get itemData() {
    return super.itemData || `${this.startField.data}#${this.endField.data}`;
  }

  @Widget.Reactive()
  public get itemName() {
    return super.itemName || `${this.startField.name}#${this.endField.name}`;
  }

  public initialize(props) {
    super.initialize(props);
    const { startField, endField } = findRangeFields(this.rootRuntimeContext, this.getDsl().widgets || []);
    if (!startField || !endField) {
      throw new Error('range widget StartField and EndField is required.');
    }
    this.startField = startField;
    this.endField = endField;
    this.subPath = this.itemName;
    return this;
  }

  @Widget.Reactive()
  public get minWidth() {
    return super.minWidth || '120';
  }

  protected get format(): string | undefined {
    return this.getDsl().format;
  }

  protected get valueFormat() {
    return defaultFormat;
  }

  protected get dateFormat(): string | undefined {
    return this.getDsl().dateFormat;
  }

  protected get timeFormat(): string | undefined {
    return this.getDsl().timeFormat;
  }

  protected get defaultFormat() {
    return defaultFormat;
  }

  protected hasDateFormat = true;

  protected hasTimeFormat = true;

  protected convertDateFormat(format: string): string | undefined {
    return DateFormatMap.get(format);
  }

  protected convertTimeFormat(format: string): string | undefined {
    return TimeFormatMap.get(format);
  }

  protected convertFormat(format: string): string | undefined {
    return DateTimeFormatMap.get(format);
  }

  protected formatValue(value: Date | string | undefined, format: string) {
    let dateValue: Date | undefined;
    if (isString(value)) {
      dateValue = DateUtil.toDate(value, this.valueFormat);
    } else if (isDate(value)) {
      dateValue = value;
    } else if (value) {
      if (isDev()) {
        console.warn('无法识别的日期值, 显示的值可能出现异常. value: ', value);
      }
      return toString(value);
    } else {
      return '';
    }
    if (dateValue) {
      return DateUtil.dateFormat(dateValue, format);
    }
  }

  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    const startField = this.startField?.data;
    const endField = this.endField?.data;
    if (startField && endField) {
      let startValue = context.data[startField];
      let endValue = context.data[endField];
      if (isEmpty(startValue) && isEmpty(endValue)) {
        return '';
      }
      let format = DateUtil.fetchDatetimeFormat(
        { hasDateFormat: this.hasDateFormat, hasTimeFormat: this.hasTimeFormat },
        this.format,
        this.dateFormat,
        this.timeFormat,
        this.convertFormat,
        this.convertDateFormat,
        this.convertTimeFormat
      );
      if (!format) {
        format = this.defaultFormat;
      }
      startValue = this.formatValue(startValue as string, format);
      endValue = this.formatValue(endValue as string, format);
      return `${startValue} ~ ${endValue}`;
    }
    return '';
  }
}
