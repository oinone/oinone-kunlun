import {
  getRealTtype,
  IResourceDateTimeFormat,
  queryResourceDateTimeFormat,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import {
  BooleanHelper,
  defaultDateFormat,
  defaultDateFormatKey,
  defaultFormat,
  defaultTimeFormatKey,
  ObjectUtils,
  Optional
} from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { WidgetTrigger } from '@oinone/kunlun-vue-ui-common';
import { Widget, WidgetComponent } from '@oinone/kunlun-vue-widget';
import moment from 'moment';
import { FormFieldWidget } from '../../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../../typing';
import { translateByOffset } from './date-common';
import DefaultDateTimePicker from './DefaultDateTimePicker.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Search, ViewType.Form],
    ttype: ModelFieldType.DateTime
  })
)
export class FormDateTimeFieldWidget extends FormFieldWidget<string> {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultDateTimePicker;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(this.getInitializeComponent());
    return this;
  }

  @Widget.Reactive()
  protected resourceDateTimeFormat = {} as IResourceDateTimeFormat;

  @Widget.Reactive()
  protected open = false;

  /**
   * xml配置的格式化，优先级最高
   */
  @Widget.Reactive()
  protected get format(): string | undefined {
    return this.getDsl().format;
  }

  /**
   * 日期、时间格式化的合并项
   * dateFormat -> YYYY-MM-DD
   * timeFormat -> hh:mm:ss
   *
   * @returns YYYY-MM-DD hh:mm:ss
   */
  @Widget.Reactive()
  protected get dateTimeFormat(): string | undefined {
    return [this.dateFormat, this.timeFormat].filter(Boolean).join(' ');
  }

  /**
   * 字段value 对应的格式化
   */
  @Widget.Reactive()
  protected get valueFormat(): string | undefined {
    return this.getDsl().valueFormat;
  }

  /**
   * 时间格式化
   */
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

  /**
   * 日期格式化
   */
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
  protected get allowClear(): boolean {
    return Optional.ofNullable(this.getDsl().allowClear)
      .map((v) => BooleanHelper.toBoolean(v))
      .orElse(true)!;
  }

  @Widget.Reactive()
  protected get startDate() {
    return this.executeExpression(this.getDsl().startDate!, null);
  }

  @Widget.Reactive()
  protected get realStartDate() {
    const _startDate = this.startDate;
    if (_startDate) {
      return translateByOffset(_startDate, this.startDateOffset, this.startDateOffsetUnit, this.dateTimeFormat).format(
        this.genDefaultFormat()
      );
    }
    return _startDate;
  }

  @Widget.Reactive()
  protected get startDateOffset() {
    return this.getDsl().startDateOffset || 0;
  }

  @Widget.Reactive()
  protected get startDateOffsetUnit() {
    return this.getDsl().startDateOffsetUnit;
  }

  @Widget.Reactive()
  protected get endDate() {
    return this.executeExpression(this.getDsl().endDate!, null);
  }

  @Widget.Reactive()
  protected get realEndDate() {
    const _endDate = this.endDate;
    if (_endDate) {
      return translateByOffset(_endDate, this.endDateOffset, this.endDateOffsetUnit, this.dateTimeFormat).format(
        this.genDefaultFormat()
      );
    }
    return _endDate;
  }

  @Widget.Reactive()
  protected get endDateOffset() {
    return this.getDsl().endDateOffset || 0;
  }

  @Widget.Reactive()
  protected get endDateOffsetUnit() {
    return this.getDsl().endDateOffsetUnit;
  }

  @Widget.Reactive()
  protected showTimeDefaultValue = moment('00:00:00', this.timeFormat || 'HH:mm:ss');

  @Widget.Method()
  public change(v) {
    super.change(v);
    this.blur();
  }

  protected genDefaultFormat() {
    const { field } = this;
    if (field) {
      return getRealTtype(field) === ModelFieldType.DateTime ? defaultFormat : defaultDateFormat;
    }
    return defaultFormat;
  }

  protected defaultConstructDataTrigger() {
    return [WidgetTrigger.CUSTOM];
  }

  protected defaultClearFieldsTrigger() {
    return [WidgetTrigger.CUSTOM];
  }

  public async validator(): Promise<ValidatorInfo> {
    const res = await super.validator();
    if (!isValidatorSuccess(res)) {
      return res;
    }
    if (!this.value) {
      return this.validatorSuccess();
    }
    const startDateValue = this.realStartDate;
    const endDateValue = this.realEndDate;
    if (startDateValue) {
      if (new Date(startDateValue) > new Date(this.value)) {
        return this.validatorError(translateValueByKey('不能小于起始日期(含偏移量)'));
      }
    }
    if (endDateValue) {
      if (new Date(endDateValue) < new Date(this.value)) {
        return this.validatorError(translateValueByKey('不能大于结束日期(含偏移量)'));
      }
    }
    return this.validatorSuccess();
  }

  protected async $$created() {
    super.$$created();
    this.resourceDateTimeFormat = await queryResourceDateTimeFormat();
  }
}
