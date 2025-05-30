import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { createVNode } from 'vue';

import { BaseFieldWidget, BaseTableFieldWidget } from '../../../../basic';
import DefaultTableImage from './DefaultTableImage.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    widget: 'UploadImg',
    ttype: [ModelFieldType.String, ModelFieldType.Text]
  })
)
export class TableStringUploadImageFieldWidget extends BaseTableFieldWidget {
  @Widget.Method()
  public renderDefaultSlot(context) {
    const value = this.compute(context);
    if (value) {
      return [createVNode(DefaultTableImage, { currentValue: value })];
    }
    return [];
  }
}

/**
 * @deprecated please using TableStringUploadImageFieldWidget
 */
export const TableStringImageFieldWidget = TableStringUploadImageFieldWidget;
