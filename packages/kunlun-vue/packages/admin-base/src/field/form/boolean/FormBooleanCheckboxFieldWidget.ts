import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import { ValidatorInfo } from '../../../typing';
import CheckboxCom from './Checkbox.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search, ViewType.Detail],
    ttype: ModelFieldType.Boolean,
    widget: 'Checkbox'
  })
)
export class FormBooleanCheckboxFieldWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(CheckboxCom);
    return this;
  }

  public async validator(): Promise<ValidatorInfo> {
    return this.validatorSkip();
  }
}
