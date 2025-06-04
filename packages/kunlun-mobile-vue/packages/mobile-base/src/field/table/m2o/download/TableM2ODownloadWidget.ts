import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { RowContext } from '../../../../ui';
import { Widget } from '@oinone/kunlun-vue-widget';
import { createVNode, VNode } from 'vue';
import { BaseFieldWidget } from '../../../../basic';
import { TableM2OFieldWidget } from '../../relation';
import Link from './Link.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    widget: 'Upload',
    viewType: [ViewType.Table],
    ttype: [ModelFieldType.ManyToOne, ModelFieldType.ManyToMany]
  })
)
export class TableM2ODownloadWidget extends TableM2OFieldWidget {
  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    const value = this.compute(context);
    if (value) {
      return [
        createVNode(Link, {
          href: value.url,
          filename: value.name
        })
      ];
    }
    return [];
  }
}
