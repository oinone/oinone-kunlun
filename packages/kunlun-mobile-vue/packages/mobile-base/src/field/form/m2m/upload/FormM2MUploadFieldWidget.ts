import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { FormFieldWidget } from '../../../../basic';
import { UploadCom } from '../../../../components';
import { FormM2MFieldUploadBaseWidget } from '../base/FormM2MFieldUploadBaseWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail],
    ttype: ModelFieldType.ManyToMany,
    widget: ['Upload']
  })
)
export class FormM2MUploadFieldWidget extends FormM2MFieldUploadBaseWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(UploadCom);
    return this;
  }
}
