import { SubmitHandler, SubmitValue, translateValueByKey } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { BigNumber, NumberHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isEmpty, isNil, toString } from 'lodash-es';
import { FormFieldWidget } from '../../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../../typing';
import { numberZeroFill } from '../../util';
import { FormIntegerFieldWidget } from '../integer';
import DefaultFloat from './DefaultFloat.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: [ModelFieldType.Float]
  })
)
export class FormFloatFieldWidget extends FormIntegerFieldWidget {
  @Widget.Reactive()
  protected minSafeInteger = Number.MIN_SAFE_INTEGER;

  @Widget.Reactive()
  protected maxSafeInteger = Number.MAX_SAFE_INTEGER;

  protected isChange = false;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultFloat);
    return this;
  }

  @Widget.Reactive()
  public get value() {
    let val = this.compute();
    if (!this.isChange) {
      val = this.valueZeroFill(val);
    }
    return val;
  }

  @Widget.Method()
  public change(value) {
    this.isChange = true;
    super.change(value);
  }

  public validator(): Promise<ValidatorInfo> {
    return super.rawValidator().then((res) => {
      if (!isValidatorSuccess(res)) {
        return res;
      }
      const { value, precision } = this;
      res = this.checkValue(value, res);
      if (!isValidatorSuccess(res)) {
        return res;
      }
      const realValue = toString(value);
      if (isEmpty(realValue)) {
        return res;
      }
      if (!NumberHelper.isNumber(realValue) || realValue!.indexOf('.') === 0) {
        return this.validatorError(translateValueByKey('请输入正确小数'));
      }
      if (isNil(precision)) {
        return res;
      }
      const num = new BigNumber(realValue);
      if (num.decimalPlaces() > precision) {
        return this.validatorError(
          `${translateValueByKey('小数位数不能超过')}${precision}${translateValueByKey('位')}`
        );
      }
      return res;
    });
  }

  public submit(submitValue: SubmitValue) {
    let val = this.value;
    if (val != null) {
      val = new BigNumber(val.toString()).toString();
    }
    if (this.isChange) {
      val = this.valueZeroFill(val);
    }
    return SubmitHandler.DEFAULT(this.field, this.itemName, submitValue, val);
  }

  protected valueZeroFill(val) {
    if (!isEmpty(toString(val))) {
      return numberZeroFill(toString(val), this.precision);
    }
    return val;
  }
}
