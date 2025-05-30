import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { FormFieldWidget } from '../../../../basic';
import { UploadImgCom } from '../../../../components';
import { FormM2MFieldUploadBaseWidget } from '../base/FormM2MFieldUploadBaseWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail],
    ttype: ModelFieldType.ManyToMany,
    widget: ['UploadImg']
  })
)
export class FormM2MUploadImgFieldWidget extends FormM2MFieldUploadBaseWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(UploadImgCom);
    return this;
  }
}
