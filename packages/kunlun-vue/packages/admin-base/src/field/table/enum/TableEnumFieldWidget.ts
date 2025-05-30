import { RuntimeEnumerationField, RuntimeEnumerationOption } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { RowContext } from '@kunlun/vue-ui';
import { Widget } from '@kunlun/vue-widget';
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
  protected getRenderOptions(context: RowContext) {
    /**
     * 如果枚举项的 displayName / label 是表达式，才需要进行表达式解析，否则不做处理
     */
    const existingExpress = this.options.some(
      (o) => this.isExpressionString(o.displayName) || this.isExpressionString(o.label)
    );

    if (!existingExpress) {
      return this.options;
    }

    return this.options.map((opt) => {
      const displayName = this.executeExpression(context.data, opt.displayName!, opt.displayName);
      const label = this.executeExpression(context.data, opt.label!, opt.label);
      return {
        ...opt,
        displayName,
        label
      };
    });
  }

  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    const node = [
      createVNode(TableEnum, {
        value: this.compute(context),
        currentValue: this.handleValue(this.compute(context)),
        options: this.getRenderOptions(context),
        optionColor: this.optionColor,
        optionColorStyle: this.optionColorStyle
      })
    ];
    return node;
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
