import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { createVNode, VNode } from 'vue';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../basic';

interface IValue {
  name: string;
  value: string;
}

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.Map
  })
)
export class TableMapFieldWidget extends BaseTableFieldWidget {
  protected handleValue(value): any {
    const res: IValue[] = [];
    const val = value as IValue[];

    if (val && Object.keys(val).length) {
      Object.keys(val).forEach((key) => {
        res.push({
          name: key,
          value: val[key]
        });
      });
    }

    return res;
  }

  @Widget.Method()
  public renderDefaultSlot(context): VNode[] | string {
    const currentValue = this.handleValue(this.compute(context)) as any[];
    const nodes = [] as VNode[];
    if (currentValue && currentValue.length) {
      for (const v of currentValue) {
        nodes.push(createVNode('span', { class: 'table-map-item' }, `${v.name}:${v.value}`));
      }
    } else {
      return '';
    }
    return [createVNode('div', { class: 'table-map' }, nodes)];
  }
}
