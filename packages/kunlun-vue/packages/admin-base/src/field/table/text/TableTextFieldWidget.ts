import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import type { RowContext } from '@oinone/kunlun-vue-ui';
import { Widget } from '@oinone/kunlun-vue-widget';
import { createVNode, type VNode } from 'vue';
import { BaseFieldWidget } from '../../../basic';
import { TableStringFieldWidget } from '../string';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.Text
  })
)
export class TableTextFieldWidget extends TableStringFieldWidget {
  @Widget.Method()
  public onAutofocus(params: { cell: HTMLElement }) {
    const { cell } = params;
    if (!cell) {
      return;
    }
    const input = cell.querySelector('textarea') as HTMLElement;
    if (input) {
      input.focus();
    }
  }

  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    const value = this.compute(context);

    return [
      createVNode(
        'span',
        {
          class: 'table-text-field-value'
        },
        value
      )
    ];
  }
}
