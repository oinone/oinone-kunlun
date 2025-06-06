import { isEmptyValue, ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { FormFieldWidget } from '../../../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../../../typing';
import { FormStringFieldWidget } from '../FormStringFieldWidget';
import { IInputmodeEnum } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { translateValueByKey } from '@oinone/kunlun-engine';

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

  @Widget.Reactive()
  protected get inputmode(): IInputmodeEnum {
    return IInputmodeEnum.EMAIL;
  }
}
