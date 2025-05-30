import { ModelFieldType, ViewType } from '@kunlun/meta';
import { BigNumber, NumberHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { isEmpty, isNil, toString } from 'lodash-es';
import { FormFieldWidget } from '../../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../../typing';
import { numberZeroFill } from '../../util';
import { FormIntegerFieldWidget } from '../integer';
import DefaultFloat from './DefaultFloat.vue';
import { IInputmodeEnum } from '@kunlun/vue-ui-common';
import { translateValueByKey } from '@kunlun/engine';

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

  // 是否是前端页面引起的数据变化, 与之对应的是: 是否后端数据回填
  protected isFrontChange = false;

  @Widget.Reactive()
  protected get inputmode(): IInputmodeEnum {
    return IInputmodeEnum.DECIMAL;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultFloat);
    return this;
  }

  @Widget.Provide()
  @Widget.Reactive()
  public get value() {
    let val = this.compute();
    if (!this.isFrontChange) {
      val = this.valueZeroFill(val);
    }
    this.isFrontChange = false;
    return val;
  }

  @Widget.Provide()
  @Widget.Method()
  public change(value) {
    this.isFrontChange = true;
    super.change(value);
  }

  public validator(): Promise<ValidatorInfo> {
    return super.validator().then((res) => {
      if (!isValidatorSuccess(res)) {
        return res;
      }
      const { value, precision } = this;
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
          `${translateValueByKey('小数位数不能超过')} ${precision} ${translateValueByKey('位')}`
        );
      }
      return res;
    });
  }

  @Widget.Reactive()
  public blur() {
    this.setValue(this.valueZeroFill(this.value));
    super.blur();
  }

  protected valueZeroFill(val) {
    if (!isEmpty(toString(val))) {
      return numberZeroFill(toString(val), this.precision);
    }
    return val;
  }
}
