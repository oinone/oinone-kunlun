import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { createVNode } from 'vue';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../basic';
import TableM2OUploadImgCom from './TableM2OUploadImgFieldWidget.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({ viewType: ViewType.Table, ttype: ModelFieldType.ManyToOne, widget: ['UploadImg'] })
)
export class TableM2OUploadImgFieldWidget extends BaseTableFieldWidget {
  @Widget.Method()
  public renderDefaultSlot(context) {
    const value = this.compute(context);
    if (value) {
      return [createVNode(TableM2OUploadImgCom, { value })];
    }
    return [];
  }
}
