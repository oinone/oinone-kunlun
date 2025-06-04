import { IResourceDateTimeFormat, queryResourceDateTimeFormat, RuntimeSearchField } from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import {
  BooleanHelper,
  defaultDateFormatKey,
  defaultTimeFormatKey,
  ObjectUtils,
  Optional,
  RSQLOperators
} from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { ValidateTrigger } from '@oinone/kunlun-vue-ui-common';
import { Widget, WidgetComponent } from '@oinone/kunlun-vue-widget';
import moment from 'moment';
import { BaseElementWidget } from '../../../../../basic';
import DefaultDateTimeRangePicker from '../../../../form/date/range/DefaultDateTimeRangePicker.vue';
import { FormRangeFieldsWidget } from '../../../../range';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Search,
    widget: 'DateTimeRangePicker'
  })
)
export class SearchDateTimeRangeElementWidget extends FormRangeFieldsWidget<[string, string], RuntimeSearchField> {
  public defaultValidateTrigger: ValidateTrigger[] = [ValidateTrigger.CHANGE];

  protected getInitializeComponent(): WidgetComponent {
    return DefaultDateTimeRangePicker;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(this.getInitializeComponent());
    const { operator } = this;
    if (operator) {
      const operators = operator.split?.(',');
      if (operators?.length === 2) {
        const [startOperator, endOperator] = operators;
        if (!this.startField.operator) {
          this.startField.operator = startOperator;
        }
        if (!this.endField.operator) {
          this.endField.operator = endOperator;
        }
      }
    }
    return this;
  }

  @Widget.Reactive()
  protected resourceDateTimeFormat = {} as IResourceDateTimeFormat;

  @Widget.Reactive()
  protected get format(): string | undefined {
    return this.getDsl().format;
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
  protected get allowClear(): boolean {
    return Optional.ofNullable(this.getDsl().allowClear)
      .map((v) => BooleanHelper.toBoolean(v))
      .orElse(true)!;
  }

  @Widget.Reactive()
  protected get startPlaceholder() {
    return this.getDsl().startPlaceholder;
  }

  @Widget.Reactive()
  protected get endPlaceholder() {
    return this.getDsl().endPlaceholder;
  }

  @Widget.Reactive()
  protected get showTimeDefaultValue() {
    return [moment('00:00:00', this.timeFormat || 'HH:mm:ss'), moment('00:00:00', this.timeFormat || 'HH:mm:ss')];
  }

  @Widget.Reactive()
  protected get operator(): string | undefined {
    return this.getDsl().operator || `${RSQLOperators.GREATER_THAN_OR_EQUAL.symbol},${RSQLOperators.LESS_THAN.symbol}`;
  }

  protected async $$created() {
    super.$$created();
    this.resourceDateTimeFormat = await queryResourceDateTimeFormat();
  }
}
