import { ViewType, ModelFieldType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseFieldWidget } from '../../../../basic';
import { FormStringSignatureFieldWidget } from '../../../form';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: 'Signature'
  })
)
export class DetailStringSignatureFieldWidget extends FormStringSignatureFieldWidget {
  // 是否展示清除按钮
  @Widget.Reactive()
  public get showClearButton() {
    return false;
  }

  // 是否展示保存按钮
  @Widget.Reactive()
  public get showSaveButton() {
    return false;
  }
}
