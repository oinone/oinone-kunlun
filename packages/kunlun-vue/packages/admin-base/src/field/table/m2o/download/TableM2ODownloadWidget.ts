import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { RowContext } from '@oinone/kunlun-vue-ui';
import { Widget } from '@oinone/kunlun-vue-widget';
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
