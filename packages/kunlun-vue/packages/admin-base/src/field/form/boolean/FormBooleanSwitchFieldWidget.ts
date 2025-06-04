import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import { ValidatorInfo } from '../../../typing';
import SwitchCom from './Switch.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.Boolean
  })
)
export class FormBooleanSwitchFieldWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(SwitchCom);
    return this;
  }

  public async validator(): Promise<ValidatorInfo> {
    return this.validatorSuccess();
  }
}
