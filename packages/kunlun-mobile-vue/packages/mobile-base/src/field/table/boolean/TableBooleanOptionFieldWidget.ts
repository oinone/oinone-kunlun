import { RuntimeEnumerationField, RuntimeEnumerationOption } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { RowContext } from '../../../ui';
import { Widget } from '@oinone/kunlun-vue-widget';
import { createVNode, VNode } from 'vue';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../basic';
import { OptionColorStyle } from '../../FieldCommonEnum';
import { enumFetchLabelByValue } from '../../util';
import TableEnum from '../enum/TableEnum.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.Boolean,
    widget: ['Select', 'radio']
  })
)
export class TableBooleanOptionFieldWidget extends BaseTableFieldWidget<string | string[], RuntimeEnumerationField> {
  @Widget.Reactive()
  protected get optionColor() {
    return this.optionColorStyle === OptionColorStyle.COLORFUL;
  }

  @Widget.Reactive()
  protected get optionColorStyle() {
    return this.getDsl().optionColorStyle || OptionColorStyle.COLORFUL;
  }

  @Widget.Reactive()
  protected get options(): RuntimeEnumerationOption[] {
    return this.field.options || [];
  }

  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    const value = this.compute(context);
    return [
      createVNode(TableEnum, {
        value,
        currentValue: this.handleValue(value),
        options: this.options,
        optionColor: this.optionColor,
        optionColorStyle: this.optionColorStyle
      })
    ];
  }

  protected handleValue(value): any {
    const options = this.options;
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
