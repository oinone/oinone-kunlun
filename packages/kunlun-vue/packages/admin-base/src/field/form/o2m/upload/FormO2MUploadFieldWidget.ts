import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';

import { FormFieldWidget } from '../../../../basic';
import { UploadCom } from '../../../../components';
import { FormO2MFieldUploadBaseWidget } from '../base/FormO2MFieldUploadBaseWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail, ViewType.Gallery],
    ttype: ModelFieldType.OneToMany,
    widget: 'Upload'
  })
)
export class FormO2MUploadFieldWidget extends FormO2MFieldUploadBaseWidget {
  @Widget.Reactive()
  protected get cdnKey() {
    return this.getDsl().cdnKey?.trim?.();
  }

  @Widget.Reactive()
  protected get privateLink() {
    return BooleanHelper.toBoolean(this.getDsl().privateLink);
  }

  public initialize(config) {
    super.initialize(config);
    this.setComponent(UploadCom);
    return this;
  }
}
