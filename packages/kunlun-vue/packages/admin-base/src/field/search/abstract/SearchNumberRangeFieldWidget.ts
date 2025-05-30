import { RuntimeNumberField, RuntimeSearchField } from '@kunlun/engine';
import { BooleanHelper, NumberHelper, Optional, RSQLCompositeOperators } from '@kunlun/shared';
import { Widget, WidgetComponent } from '@kunlun/vue-widget';
import { isNil, toString } from 'lodash-es';
import { NumberValue } from '../../form';
import { SearchRangeFieldWidget } from '../../range';
import DefaultNumberInputRange from './DefaultNumberInputRange.vue';

export abstract class SearchNumberRangeFieldWidget extends SearchRangeFieldWidget<
  [NumberValue, NumberValue],
  RuntimeNumberField & RuntimeSearchField
> {
  @Widget.Reactive()
  protected minSafeInteger = Number.MIN_SAFE_INTEGER;

  @Widget.Reactive()
  protected maxSafeInteger = Number.MAX_SAFE_INTEGER;

  protected getInitializeComponent(): WidgetComponent {
    return DefaultNumberInputRange;
  }

  public initialize(props) {
    super.initialize(props);
    if (!this.field.operator) {
      this.field.operator = RSQLCompositeOperators.GE_LE;
    }
    return this;
  }

  @Widget.Reactive()
  protected get precision(): number | null | undefined {
    const decimal = this.executeExpression(this.getDsl().decimal) as number;
    if (isNil(decimal)) {
      return NumberHelper.toNumber(this.executeExpression(toString(this.field.decimal)));
    }
    return NumberHelper.toNumber(decimal);
  }

  @Widget.Reactive()
  protected get showThousandth() {
    return Optional.ofNullable(this.getDsl().showThousandth)
      .map((v) => this.executeExpression(toString(v), toString(false)))
      .map((v) => BooleanHelper.toBoolean(v))
      .orElse(false);
  }
}
