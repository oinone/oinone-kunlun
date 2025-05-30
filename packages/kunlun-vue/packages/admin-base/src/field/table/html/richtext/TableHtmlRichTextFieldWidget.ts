import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { createVNode } from 'vue';

import { BaseFieldWidget, BaseTableFieldWidget } from '../../../../basic';
import TableRichText from './TableRichText.vue';

@SPI.ClassFactory(BaseFieldWidget.Token({ viewType: ViewType.Table, ttype: ModelFieldType.HTML }))
export class TableHtmlRichTextFieldWidget extends BaseTableFieldWidget {
  @Widget.Reactive()
  public get title() {
    return this.getDsl().title || this.field.label;
  }

  @Widget.Method()
  public renderDefaultSlot(context) {
    return [
      createVNode(TableRichText, {
        value: this.compute(context),
        title: this.title
      })
    ];
  }
}

/**
 * @deprecated please using TableHtmlRichTextFieldWidget
 */
export const TableHTMLRichTextFieldWidget = TableHtmlRichTextFieldWidget;
