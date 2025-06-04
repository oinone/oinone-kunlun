import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { FormComplexFieldWidget, FormFieldWidget } from '../../basic';
import FormBizAuditField from './FormBizAuditField.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.Text,
    widget: 'FormBizAuditField'
  })
)
export class FormBizAuditFieldWidget extends FormComplexFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(FormBizAuditField);
    return this;
  }

  protected mountedProcess(): ReturnPromise<void> {
    return undefined;
  }
}
