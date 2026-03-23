import type { RuntimeNumberField } from '@oinone/kunlun-engine';
import { BooleanHelper, NumberHelper, Optional } from '@oinone/kunlun-shared';
import type { RowContext } from '@oinone/kunlun-vue-ui';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isNil, toString } from 'lodash-es';
import type { VNode } from 'vue';
import { BaseTableFieldWidget } from '../../../basic';
import { numberAddThousandth, numberZeroFill } from '../../util';

export class TableNumberWidget extends BaseTableFieldWidget<string | number, RuntimeNumberField> {
  protected getShowThousandth(context: RowContext) {
    return Optional.ofNullable(this.getDsl().showThousandth)
      .map((v) => this.executeExpression(context.data, v))
      .map((v) => BooleanHelper.toBoolean(toString(v)))
      .orElse(false);
  }

  protected getPrecision(context: RowContext): number | null | undefined {
    const decimal = this.executeExpression(context.data, this.getDsl().decimal) as number;
    if (isNil(decimal)) {
      return NumberHelper.toNumber(this.executeExpression(context.data, toString(this.field.decimal)));
    }
    return decimal;
  }

  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    const value = numberZeroFill(toString(super.compute(context)), this.getPrecision(context));
    if (this.getShowThousandth(context)) {
      return numberAddThousandth(value);
    }
    return value;
  }
}
