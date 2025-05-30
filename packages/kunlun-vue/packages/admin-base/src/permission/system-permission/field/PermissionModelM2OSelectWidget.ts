import { FormM2OSelectFieldWidget } from '../../../field';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { Widget } from '@kunlun/vue-widget';
import { Condition } from '@kunlun/request';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToOne,
    widget: 'PermissionModelSelect'
  })
)
export class PermissionModelM2OSelectWidget extends FormM2OSelectFieldWidget {
  @Widget.Reactive()
  protected get domain(): string | undefined {
    let domain = super.domain;
    if (this.formData.domainExpJson) {
      const extDomain = new Condition('model').notIn(this.formData.domainExpJson as string).toString();
      domain = !domain ? extDomain : `(${domain}) and ${extDomain}`;
    }
    return domain;
  }
}
