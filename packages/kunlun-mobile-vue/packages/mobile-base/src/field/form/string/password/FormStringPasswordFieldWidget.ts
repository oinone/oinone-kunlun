import { SubmitHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../../../typing';
import { encrypt } from '../../../../util';
import { FormStringFieldWidget } from '../FormStringFieldWidget';
import Password from './Password.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search, ViewType.Detail],
    ttype: ModelFieldType.String,
    widget: ['Password']
  })
)
export class FormStringPasswordFieldWidget extends FormStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Password);
    return this;
  }

  public async validator(): Promise<ValidatorInfo> {
    const res = await this.validatorSpecific(this.value);
    if (!isValidatorSuccess(res)) {
      return res;
    }
    if (this.value == null) {
      return this.validatorSuccess();
    }
    return this.validateLength(this.value);
  }

  public submit(submitValue: SubmitValue) {
    let finalValue = this.value;
    if (this.crypto && finalValue) {
      finalValue = encrypt(finalValue);
    }
    return SubmitHandler.DEFAULT(this.field, this.itemName, submitValue, finalValue);
  }
}
