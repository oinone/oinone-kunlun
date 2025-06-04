import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget } from '../../../../basic';
import { TableStringTagFieldWidget } from '../tag/TableStringTagFieldWidget';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { createVNode, VNode } from 'vue';
import DefaultTableUpload from './DefaultTableUpload.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: [ModelFieldType.String],
    multi: true,
    widget: 'Upload'
  })
)
export class TableStringMultiUploadWidget extends TableStringTagFieldWidget {
  @Widget.Reactive()
  protected get cdnKey() {
    return this.getDsl().cdnKey?.trim?.();
  }

  @Widget.Reactive()
  protected get privateLink() {
    return BooleanHelper.toBoolean(this.getDsl().privateLink);
  }

  @Widget.Method()
  public renderDefaultSlot(context): VNode[] | string {
    const currentValue = this.compute(context) as string[];
    const { cdnKey, privateLink } = this;
    if (currentValue) {
      return [createVNode(DefaultTableUpload, { currentValue, cdnKey, privateLink })];
    }
    return [];
  }
}
