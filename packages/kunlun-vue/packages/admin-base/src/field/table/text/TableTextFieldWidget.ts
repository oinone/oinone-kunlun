import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { RowContext } from '@oinone/kunlun-vue-ui';
import { Widget } from '@oinone/kunlun-vue-widget';
import { createVNode, VNode } from 'vue';
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
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    const value = this.compute(context);

    return [
      createVNode('span', {
        // innerHTML: value ? value.replace(/\r?\n/g, '<br/>') : ''
        innerHTML: value
      })
    ];
  }
}
