import { RuntimeNumberField } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { BooleanHelper, NumberHelper, Optional } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { RowContext } from '@kunlun/vue-ui';
import { Widget } from '@kunlun/vue-widget';
import { isNil, toString } from 'lodash-es';
import { VNode } from 'vue';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../basic';
import { numberAddThousandth, numberZeroFill } from '../../util';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: [ViewType.Table],
    ttype: [ModelFieldType.Integer, ModelFieldType.Long, ModelFieldType.Float]
  })
)
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
