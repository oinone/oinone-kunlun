import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { DateUtil, defaultYearFormat, defaultYearValueFormat } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { BaseFieldWidget } from '../../../basic';
import { TableDateTimeFieldWidget } from './TableDateTimeFieldWidget';

@SPI.ClassFactory(BaseFieldWidget.Token({ viewType: ViewType.Table, ttype: [ModelFieldType.Year] }))
export class TableYearFieldWidget extends TableDateTimeFieldWidget {
  @Widget.Method()
  public renderDefaultSlot(context) {
    const value = this.compute(context);
    let cv;
    if (isNil(value)) {
      cv = '';
    } else {
      let format = DateUtil.fetchDatetimeFormat(
        { hasDateFormat: this.hasDateFormat, hasTimeFormat: this.hasTimeFormat },
        this.format,
        this.getDateFormat(context),
        this.getTimeFormat(context),
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

  protected get defaultFormat() {
    return defaultYearFormat;
  }

  protected get valueFormat(): string {
    return defaultYearValueFormat;
  }

  protected hasDateFormat = false;

  protected hasTimeFormat = false;
}
