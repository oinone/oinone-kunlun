import { RuntimeNumberField } from '@kunlun/engine';
import { BooleanHelper, NumberHelper, Optional } from '@kunlun/shared';
import { Widget } from '@kunlun/vue-widget';
import { isNil, toString } from 'lodash-es';
import { FormInputAbstractFieldWidget } from './FormInputAbstractFieldWidget';
import { IInputmodeEnum } from '@kunlun/vue-ui-common';

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

  /**
   * 它提供了用户在编辑元素或其内容时可能输入的数据类型的提示。
   * @link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Global_attributes/inputmode#%E6%B5%8F%E8%A7%88%E5%99%A8%E5%85%BC%E5%AE%B9%E6%80%A7
   * @protected
   */
  @Widget.Reactive()
  protected get inputmode(): IInputmodeEnum {
    return this.getDsl().inputmode;
  }
}
