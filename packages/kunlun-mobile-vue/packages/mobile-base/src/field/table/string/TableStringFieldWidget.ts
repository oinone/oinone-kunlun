import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { InputType } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../basic';
import { toCiphertext } from '../../util';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: [ModelFieldType.String, ModelFieldType.Phone, ModelFieldType.Email, ModelFieldType.Text]
  })
)
export class TableStringFieldWidget extends BaseTableFieldWidget<string> {
  @Widget.Reactive()
  protected get type() {
    return this.getDsl().type;
  }

  protected compute(context) {
    const value = super.compute(context);
    if (value && this.type === InputType.PASSWORD) {
      return toCiphertext(value);
    }
    return value;
  }
}
