import { RuntimeNumberField } from '@oinone/kunlun-engine';
import { BooleanHelper, NumberHelper, Optional } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isNil, toString } from 'lodash-es';
import { FormInputAbstractFieldWidget } from './FormInputAbstractFieldWidget';

export type NumberValue = string | number;

export class FormNumberAbstractFieldWidget<
  Value extends NumberValue | NumberValue[] = NumberValue | NumberValue[]
> extends FormInputAbstractFieldWidget<Value, RuntimeNumberField> {
  @Widget.Reactive()
  protected get unit() {
    return this.executeExpression<string>(this.getDsl().unit);
  }

  @Widget.Reactive()
  protected get showThousandth() {
    return Optional.ofNullable(this.getDsl().showThousandth)
      .map((v) => this.executeExpression(toString(v), toString(false)))
      .map((v) => BooleanHelper.toBoolean(v))
      .orElse(false);
  }

  @Widget.Reactive()
  public get hiddenStepHandle() {
    return BooleanHelper.toBoolean(this.getDsl().hiddenStepHandle);
  }

  @Widget.Reactive()
  protected get size() {
    return this.executeExpression(this.getDsl().size, this.field.size) || this.field.size;
  }

  @Widget.Reactive()
  protected get precision(): number | null | undefined {
    const decimal = this.executeExpression(this.getDsl().decimal) as number;
    if (isNil(decimal)) {
      return NumberHelper.toNumber(this.executeExpression(toString(this.field.decimal)));
    }
    return NumberHelper.toNumber(decimal);
  }
}
