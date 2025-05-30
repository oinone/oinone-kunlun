import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseFieldWidget } from '../../../../basic';
import { TableStringTagFieldWidget } from '../tag/TableStringTagFieldWidget';
import { Widget } from '@kunlun/vue-widget';
import { createVNode, VNode } from 'vue';
import { BooleanHelper } from '@kunlun/shared';
import DefaultTableUpload from './DefaultTableUpload.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
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
