import { isEmptyValue, ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { IInputmodeEnum } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { translateValueByKey } from '@oinone/kunlun-engine';

import { FormFieldWidget } from '../../../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../../../typing';
import { FormStringFieldWidget } from '../FormStringFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.Phone
  })
)
export class FormPhoneFieldWidget extends FormStringFieldWidget {
  public async validator(): Promise<ValidatorInfo> {
    const res = await super.validator();
    if (!isValidatorSuccess(res)) {
      return res;
    }
    if (!isEmptyValue(this.value) && !/^1[3456789]\d{9}$/.test(this.value as string)) {
      return this.validatorError(translateValueByKey('手机号格式错误'));
    }
    return this.validatorSuccess();
  }

  @Widget.Reactive()
  protected get inputmode(): IInputmodeEnum {
    return IInputmodeEnum.NUMERIC;
  }
}
