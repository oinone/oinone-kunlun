import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { createVNode } from 'vue';
import { BaseFieldWidget } from '../../../../basic';
import { TableStringFieldWidget } from '../TableStringFieldWidget';
import DefaultTableUpload from './DefaultTableUpload.vue';
import { BooleanHelper } from '@kunlun/shared';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: [ModelFieldType.String],
    multi: false,
    widget: 'Upload'
  })
)
export class TableStringUploadWidget extends TableStringFieldWidget {

  @Widget.Reactive()
  protected get cdnKey() {
    return this.getDsl().cdnKey?.trim?.();
  }

  @Widget.Reactive()
  protected get privateLink() {
    return BooleanHelper.toBoolean(this.getDsl().privateLink);
  }

  @Widget.Method()
  public renderDefaultSlot(context) {
    const value = this.compute(context);
    if (value) {
      return [createVNode(DefaultTableUpload, { currentValue: value })];
    }
    return [];
  }
}
