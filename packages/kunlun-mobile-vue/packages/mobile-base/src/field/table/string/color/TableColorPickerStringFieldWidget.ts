import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { createVNode } from 'vue';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../../basic';

import DefaultColorPicker from './DefaultColorPicker.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: [ModelFieldType.String],
    widget: ['ColorPicker']
  })
)
export class TableColorPickerStringFieldWidget extends BaseTableFieldWidget {
  @Widget.Method()
  public renderDefaultSlot(context) {
    const value = this.compute(context);
    if (value) {
      return [createVNode(DefaultColorPicker, { value })];
    }
    return [];
  }
}
