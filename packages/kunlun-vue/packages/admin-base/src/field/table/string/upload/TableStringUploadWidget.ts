import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { createVNode } from 'vue';
import { BaseFieldWidget } from '../../../../basic';
import { TableStringFieldWidget } from '../TableStringFieldWidget';
import DefaultTableUpload from './DefaultTableUpload.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
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
    const { cdnKey, privateLink } = this;
    const value = this.compute(context);
    if (value) {
      return [createVNode(DefaultTableUpload, { currentValue: value, cdnKey, privateLink })];
    }
    return [];
  }
}
