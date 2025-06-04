import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { createVNode } from 'vue';

import { BaseFieldWidget, BaseTableFieldWidget } from '../../../../basic';
import DefaultTableImage from './DefaultTableImage.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    widget: 'UploadImg',
    ttype: ModelFieldType.String
  })
)
export class TableStringImageFieldWidget extends BaseTableFieldWidget {
  @Widget.Method()
  public renderDefaultSlot(context) {
    const value = this.compute(context);
    if (value) {
      return [createVNode(DefaultTableImage, { currentValue: value })];
    }
    return [];
  }
}
