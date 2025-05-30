import { FormStringFieldWidget } from '../../../field';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import Component from './PermissionExpDisplayName.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: 'DomainExpDisplayName'
  })
)
export class PermissionExpDisplayNameWidget extends FormStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Component);
    return this;
  }
}
