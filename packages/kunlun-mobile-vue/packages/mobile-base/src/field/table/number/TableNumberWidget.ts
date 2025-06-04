import { RuntimeNumberField } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, Optional } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { RowContext } from '../../../ui';
import { isNil, toString } from 'lodash-es';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../basic';
import { numberAddThousandth, numberZeroFill } from '../../util';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: [ViewType.Table],
    ttype: [ModelFieldType.Integer, ModelFieldType.Long, ModelFieldType.Float, ModelFieldType.Currency]
  })
)
export class TableNumberWidget extends BaseTableFieldWidget<string | number, RuntimeNumberField> {
  protected getShowThousandth(context: RowContext) {
    return Optional.ofNullable(this.getDsl().showThousandth)
      .map((v) => this.executeExpression(context.data, v))
      .map((v) => BooleanHelper.toBoolean(toString(v)))
      .orElse(false);
  }

  protected getPrecision(context: RowContext): number | undefined {
    const decimal = this.executeExpression(context.data, this.getDsl().decimal) as number;
    if (isNil(decimal)) {
      return Number(this.executeExpression(context.data, toString(this.field.decimal)));
    }
    return decimal;
  }

  protected compute(context: RowContext): string | number {
    const value = numberZeroFill(toString(super.compute(context)), this.getPrecision(context));
    if (this.getShowThousandth(context)) {
      return numberAddThousandth(value);
    }
    return value;
  }
}
