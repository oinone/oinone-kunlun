import {
  getRealTtype,
  IResourceDateTimeFormat,
  queryResourceDateTimeFormat,
  translateValueByKey
} from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import {
  BooleanHelper,
  DateUtil,
  defaultDateFormat,
  defaultDateFormatKey,
  defaultFormat,
  defaultTimeFormatKey,
  ObjectUtils,
  Optional
} from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { WidgetTrigger } from '@kunlun/vue-ui-common';
import { Widget, WidgetComponent } from '@kunlun/vue-widget';
import { range } from 'lodash-es';
import moment, { Moment } from 'moment';
import { FormFieldWidget } from '../../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../../typing';
import { DateQuickOption, DateQuickOptionListMap, DateUnit, translateByOffset } from './date-common';
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
  protected get quickOptions(): DateQuickOption[] {
    const _quickOptions = this.getDsl().quickOptions;
    if (_quickOptions) {
      return _quickOptions.split(',') as DateQuickOption[];
    }
    return [];
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
  protected get showTimeDefaultValue() {
    return moment('00:00:00', DateUtil.fetchTimeFormat(this.timeFormat, undefined));
  }

  @Widget.Method()
  protected disabledDate(current: Moment) {
    if (!this.dateTimeFormat) {
      return false;
    }
    const start = moment(this.realStartDate).subtract(1, 'days'); /* 此处减一是因为antd组件 */
    const end = moment(this.realEndDate);
    const momentStart = start.endOf(DateUnit.DAY);
    const momentEnd = end.endOf(DateUnit.DAY);
    if (this.realStartDate && this.realEndDate) {
      return current < momentStart || current > momentEnd;
    }
    if (this.realStartDate) {
      return current < momentStart;
    }
    if (this.realEndDate) {
      return current > momentEnd;
    }
    return false;
  }

  @Widget.Method()
  protected disabledTime(e: Moment) {
    if (!e) {
      return {};
    }
    const currentSelectDateString = e.toDate().toLocaleDateString();
    const currentSelectHours = e.toDate().getHours();
    const currentSelectMinutes = e.toDate().getMinutes();
    if (!this.realStartDate && !this.realEndDate) {
      return {};
    }
    if (!this.realStartDate && this.realEndDate) {
      const _endDate = new Date(this.realEndDate);
      const _endDateString = _endDate.toLocaleDateString();
      const _endHours = _endDate.getHours();
      const _endMinutes = _endDate.getMinutes();
      if (new Date(_endDateString) > new Date(currentSelectDateString)) {
        return this.genLimitTime(0, 24, 0, 60, 0, 60);
      }
      if (_endHours > currentSelectHours) {
        return this.genLimitTime(0, _endHours, 0, 60, 0, 60);
      }
      if (_endMinutes > currentSelectMinutes) {
        return this.genLimitTime(0, _endHours, 0, _endMinutes, 0, 60);
      }
      return this.genLimitTime(0, _endHours, 0, _endMinutes, 0, _endDate.getSeconds());
    }
    if (!this.realEndDate && this.realStartDate) {
      const _startDate = new Date(this.realStartDate);
      const _startDateString = _startDate.toLocaleDateString();
      const _startHours = _startDate.getHours();
      const _startMinutes = _startDate.getMinutes();
      if (new Date(_startDateString) < new Date(currentSelectDateString)) {
        return this.genLimitTime(0, 24, 0, 60, 0, 60);
      }
      if (currentSelectHours > _startHours) {
        return this.genLimitTime(_startHours, 24, 0, 60, 0, 60);
      }
      if (currentSelectMinutes > _startMinutes) {
        return this.genLimitTime(_startHours, 24, _startMinutes, 60, 0, 60);
      }
      return this.genLimitTime(_startHours, 24, _startMinutes, 60, _startDate.getSeconds(), 60);
    }
    if (this.realStartDate && this.realEndDate) {
      const _startDate = new Date(this.realStartDate);
      const _startDateString = _startDate.toLocaleDateString();
      const _endDate = new Date(this.realEndDate);
      const _endDateString = _endDate.toLocaleDateString();
      const _startHours = _startDate.getHours();
      const _startMinutes = _startDate.getMinutes();
      const _endHours = _endDate.getHours();
      const _endMinutes = _endDate.getMinutes();
      const _endSeconds = _endDate.getSeconds();
      const _startSeconds = _startDate.getSeconds();
      if (_startDateString === _endDateString) {
        if (currentSelectHours === _startHours) {
          if (currentSelectMinutes === _startMinutes) {
            return this.genLimitTime(_startHours, _endHours, _startMinutes, 60, _startSeconds, 60);
          }
          return this.genLimitTime(_startHours, _endHours, _startMinutes, 60, 0, 60);
        }
        if (currentSelectHours === _endHours) {
          if (currentSelectMinutes === _endMinutes) {
            return this.genLimitTime(_startHours, _endHours, 0, _endMinutes, 0, _endSeconds);
          }
          return this.genLimitTime(_startHours, _endHours, 0, _endMinutes, 0, 60);
        }
        return this.genLimitTime(_startHours, _endHours, 0, 60, 0, 60);
      }
      if (new Date(_startDateString) >= new Date(currentSelectDateString)) {
        if (currentSelectHours > _startHours) {
          return this.genLimitTime(_startHours, 24, 0, 60, 0, 60);
        }
        if (currentSelectMinutes > _startMinutes) {
          return this.genLimitTime(_startHours, 24, _startMinutes, 60, 0, 60);
        }
        return this.genLimitTime(_startHours, 24, _startMinutes, 60, _startSeconds, 60);
      }
      if (
        new Date(currentSelectDateString) > new Date(_startDateString) &&
        new Date(currentSelectDateString) < new Date(_endDateString)
      ) {
        return this.genLimitTime(0, 24, 0, 60, 0, 60);
      }
      if (new Date(currentSelectDateString) >= new Date(_endDateString)) {
        if (_endHours > currentSelectHours) {
          return this.genLimitTime(0, _endHours, 0, 60, 0, 60);
        }
        if (_endMinutes > currentSelectMinutes) {
          return this.genLimitTime(0, _endHours, 0, _endMinutes, 0, 60);
        }
        return this.genLimitTime(0, _endHours, 0, _endMinutes, 0, _endSeconds);
      }
    }
    return {};
  }

  @Widget.Method()
  public async closePanelChange() {
    this.blur();
    if (!this.blurValueChange()) {
      return;
    }
    let isChange = await this.constructDataBack();
    const res = this.clearFieldsCallback();
    if (res) {
      isChange = res;
    }
    if (isChange) {
      this.reloadFormData$.subject.next(true);
    }
  }

  @Widget.Method()
  public openPanelChange() {
    this.setBlurValue(this.value);
    this.open = true;
  }

  @Widget.Method()
  public quickChange(quickOption) {
    const quick = DateQuickOptionListMap.get(quickOption);
    if (quick) {
      this.change(quick.getValue(this.genDefaultFormat()));
    }
    this.changeOpenValue(false);
  }

  @Widget.Method()
  public changeOpenValue(open) {
    this.open = open;
  }

  @Widget.Method()
  public correctingStartShowTimeDefaultValue(e) {
    if (!this.realStartDate || !e) {
      return e;
    }
    if (new Date(e) <= new Date(this.realStartDate)) {
      return this.realStartDate;
    }
    return e;
  }

  @Widget.Method()
  public quickOptionsCompareDisable(quickOption) {
    const quick = DateQuickOptionListMap.get(quickOption);
    const quickVal = quick.getValue(this.genDefaultFormat());
    return !!(
      (this.realEndDate && new Date(quickVal) > new Date(this.realEndDate)) ||
      (this.realStartDate && new Date(quickVal) < new Date(this.realStartDate))
    );
  }

  protected genLimitTime(startHour, endHour, startMinute, endMinute, startSecond, endSecond) {
    return {
      disabledHours: () => [...range(0, Math.min(startHour, endHour)), ...range(Math.max(startHour, endHour) + 1, 24)],
      disabledMinutes: () => [
        ...range(0, Math.min(startMinute, endMinute)),
        ...range(Math.max(startMinute, endMinute) + 1, 60)
      ],
      disabledSeconds: () => [
        ...range(0, Math.min(startSecond, endSecond)),
        ...range(Math.max(startSecond, endSecond) + 1, 60)
      ]
    };
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
        return this.validatorError(translateValueByKey('不能小于起始日期含偏移量'));
      }
    }
    if (endDateValue) {
      if (new Date(endDateValue) < new Date(this.value)) {
        return this.validatorError(translateValueByKey('不能大于结束日期含偏移量'));
      }
    }
    return this.validatorSuccess();
  }

  protected async $$created() {
    super.$$created();
    this.resourceDateTimeFormat = await queryResourceDateTimeFormat();
  }
}
