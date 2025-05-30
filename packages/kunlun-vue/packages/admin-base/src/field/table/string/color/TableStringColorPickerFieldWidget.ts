import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { createVNode } from 'vue';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../../basic';

import DefaultColorPicker from './DefaultColorPicker.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.String,
    widget: 'ColorPicker'
  })
)
export class TableStringColorPickerFieldWidget extends BaseTableFieldWidget {
  @Widget.Method()
  public renderDefaultSlot(context) {
    const value = this.compute(context);
    if (value) {
      return [createVNode(DefaultColorPicker, { value })];
    }
    return [];
  }
}

/**
 * @deprecated please using TableStringColorPickerFieldWidget
 */
export const TableColorPickerStringFieldWidget = TableStringColorPickerFieldWidget;
