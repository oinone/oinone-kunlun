import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget } from '../../../../basic';
import { UploadImgCom } from '../../../../components';
import { FormStringUploadFieldWidget } from './FormStringUploadFieldWidget';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: ['UploadImg']
  })
)
export class FormStringUploadImgFieldWidget extends FormStringUploadFieldWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(UploadImgCom);
    return this;
  }
}
