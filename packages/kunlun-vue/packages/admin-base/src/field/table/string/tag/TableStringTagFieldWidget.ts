import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { Widget } from '@kunlun/vue-widget';
import { createVNode, VNode } from 'vue';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../../basic';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    multi: true
  })
)
export class TableStringTagFieldWidget extends BaseTableFieldWidget {
  @Widget.Method()
  public renderDefaultSlot(context): VNode[] | string {
    const currentValue = this.compute(context) as string[];
    const nodes = [] as VNode[];
    if (currentValue && currentValue.length) {
      for (const v of currentValue) {
        nodes.push(
          createVNode('span', { class: 'table-string-tag-option' }, [
            createVNode('span', { class: 'table-string-tag-option-font' }, v)
          ])
        );
      }
    } else {
      return '';
    }
    return [createVNode('div', { class: 'table-string-tag' }, nodes)];
  }
}
