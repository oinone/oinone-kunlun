import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { FormFieldWidget } from '../../../../basic';
import { UploadImgCom } from '../../../../components';
import { FormO2MFieldUploadBaseWidget } from '../base/FormO2MFieldUploadBaseWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail],
    ttype: ModelFieldType.OneToMany,
    widget: ['UploadImg']
  })
)
export class FormO2MUploadImgFieldWidget extends FormO2MFieldUploadBaseWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(UploadImgCom);
    return this;
  }
}
