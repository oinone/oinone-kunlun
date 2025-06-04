import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { RowContext } from '../../../ui';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { VNode } from 'vue';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../basic';
import { enumFetchLabelByValue } from '../../util';

@SPI.ClassFactory(BaseFieldWidget.Token({ viewType: ViewType.Table, ttype: ModelFieldType.Boolean }))
export class TableBooleanFieldWidget extends BaseTableFieldWidget<boolean | string> {
  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    const value = BooleanHelper.toBoolean(this.compute(context));
    const options = this.getDsl().options || [];
    let resultValue;
    if (options && options.length) {
      resultValue = enumFetchLabelByValue(
        value,
        options.map((o) => {
          return {
            ...o,
            value: o.name
          };
        })
      );
    } else if (value === true) {
      resultValue = this.translate('kunlun.fields.boolean.true');
    } else if (value === false) {
      resultValue = this.translate('kunlun.fields.boolean.false');
    } else {
      resultValue = value;
    }
    return resultValue;
  }
}
