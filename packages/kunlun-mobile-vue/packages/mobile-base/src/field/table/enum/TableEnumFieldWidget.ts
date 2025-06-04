import { RuntimeEnumerationField, RuntimeEnumerationOption } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { RowContext } from '../../../ui';
import { Widget } from '@oinone/kunlun-vue-widget';
import { createVNode, VNode } from 'vue';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../basic';
import { OptionColorStyle } from '../../FieldCommonEnum';
import TableEnum from './TableEnum.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.Enum
  })
)
export class TableEnumFieldWidget extends BaseTableFieldWidget<string | string[], RuntimeEnumerationField> {
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
    return [
      createVNode(TableEnum, {
        value: this.compute(context),
        currentValue: this.handleValue(this.compute(context)),
        options: this.options,
        optionColor: this.optionColor,
        optionColorStyle: this.optionColorStyle
      })
    ];
  }

  protected handleValue(value: string | string[] | null | undefined): string | string[] {
    if (!value || !value.length) {
      return '';
    }
    if (Array.isArray(value)) {
      const options = value.map((v) => this.options!.find((o) => o.name === v));
      return options
        .filter((o) => !!o)
        .map((o) => o!.label || '')
        .join('，');
    }
    if (this.options) {
      const option = (this.options || [])!.find((o) => o.name === value)!;
      return (option && option.label) || '';
    }
    return '';
  }
}
