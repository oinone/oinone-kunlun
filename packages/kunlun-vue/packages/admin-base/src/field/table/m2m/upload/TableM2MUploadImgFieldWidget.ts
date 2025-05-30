import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { createVNode } from 'vue';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../../basic';
import TableM2MUploadImgCom from './TableM2MUploadImgFieldWidget.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.ManyToMany,
    widget: 'UploadImg'
  })
)
export class TableM2MUploadImgFieldWidget extends BaseTableFieldWidget {
  @Widget.Method()
  public renderDefaultSlot(context) {
    const value = this.compute(context);
    if (value) {
      return [createVNode(TableM2MUploadImgCom, { value })];
    }
    return [];
  }
}
