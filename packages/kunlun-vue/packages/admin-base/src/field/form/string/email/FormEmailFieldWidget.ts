import { translateValueByKey } from '@kunlun/engine';
import { isEmptyValue, ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { FormFieldWidget } from '../../../../basic';
import { isValidatorSuccess, ValidatorInfo, ValidatorStatus } from '../../../../typing';
import { FormStringFieldWidget } from '../FormStringFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.Email
  })
)
export class FormEmailFieldWidget extends FormStringFieldWidget {
  public async validator(): Promise<ValidatorInfo> {
    const res = await super.validator();
    if (!isValidatorSuccess(res)) {
      return res;
    }
    if (
      !isEmptyValue(this.value) &&
      !/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]+$/.test(this.value as string)
    ) {
      return this.validatorError(translateValueByKey('邮箱格式错误'));
    }
    return this.validatorSuccess();
  }
}
