import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { RowContext } from '@kunlun/vue-ui';
import { Widget } from '@kunlun/vue-widget';
import { createVNode, VNode } from 'vue';
import { BaseFieldWidget } from '../../../../basic';
import { TableM2OFieldWidget } from '../../relation';
import Link from './Link.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: [ModelFieldType.ManyToOne, ModelFieldType.OneToMany, ModelFieldType.ManyToMany],
    widget: 'Upload'
  })
)
export class TableM2ODownloadWidget extends TableM2OFieldWidget {
  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    const value = this.compute(context);
    if (value) {
      const currentValue = Array.isArray(value) ? value : [value];
      return currentValue.map((val) =>
        createVNode(Link, {
          href: val.url,
          filename: val.name
        })
      );
    }
    return [];
  }
}
