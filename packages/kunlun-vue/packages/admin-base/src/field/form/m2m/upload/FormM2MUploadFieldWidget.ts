import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BooleanHelper } from '@kunlun/shared';

import { FormFieldWidget } from '../../../../basic';
import { UploadCom } from '../../../../components';
import { FormM2MFieldUploadBaseWidget } from '../base/FormM2MFieldUploadBaseWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail, ViewType.Gallery, ViewType.Table],
    ttype: ModelFieldType.ManyToMany,
    widget: ['Upload']
  })
)
export class FormM2MUploadFieldWidget extends FormM2MFieldUploadBaseWidget {
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
