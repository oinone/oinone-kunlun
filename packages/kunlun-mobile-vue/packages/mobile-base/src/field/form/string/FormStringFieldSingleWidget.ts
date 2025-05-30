import { SubmitHandler, SubmitValue } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseFieldWidget } from '../../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../../typing';
import { encrypt } from '../../../util';
import { FormStringFieldWidget } from './FormStringFieldWidget';

/**
 * 单值且ttype为string的默认组件
 */
@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.String
  })
)
export class FormStringFieldSingleWidget extends FormStringFieldWidget {
  public submit(submitValue: SubmitValue) {
    // const finalValue = this.addPrefixSuffix(this.inputRealValue);
    // if (!finalValue && this.inputRealValue === undefined) {
    //   return undefined;
    // }
    let finalValue = this.value;
    /**
     * 数据提交的时候，如果判断当前字段是否需要加密
     */
    if (this.crypto && finalValue) {
      finalValue = encrypt(finalValue);
    }
    return SubmitHandler.DEFAULT(this.field, this.itemName, submitValue, finalValue);
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
}
