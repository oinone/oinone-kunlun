import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { RowContext } from '@oinone/kunlun-vue-ui';
import { InputType } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { VNode } from 'vue';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../basic';
import { toCiphertext } from '../../util';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: [ModelFieldType.String, ModelFieldType.Phone, ModelFieldType.Email]
  })
)
export class TableStringFieldWidget extends BaseTableFieldWidget<string> {
  @Widget.Reactive()
  public get type() {
    return this.getDsl().type;
  }

  public compute(context) {
    const value = super.compute(context);
    if (value && this.type === InputType.PASSWORD) {
      return toCiphertext(value);
    }
    return value;
  }
}
