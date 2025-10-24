import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { createVNode } from 'vue';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../basic';
import TableRichText from './TableRichText.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.HTML
  })
)
export class TableHtmlFieldWidget extends BaseTableFieldWidget {
  @Widget.Reactive()
  public get title() {
    return this.getDsl().title || this.field.label;
  }

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
 * @deprecated please using TableHtmlFieldWidget
 */
export const TableHTMLRichTextFieldWidget = TableHtmlFieldWidget;

/**
 * @deprecated please using TableHtmlFieldWidget
 */
export const TableHtmlRichTextFieldWidget = TableHtmlFieldWidget;
