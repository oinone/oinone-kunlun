import { translateValueByKey } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { BigNumber, BooleanHelper, fetchRealValue, Optional } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isEmpty, isNil, isNumber, isString, toString } from 'lodash-es';
import { FormFieldWidget } from '../../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../../typing';
import { stringIsAllNum } from '../../util';
import { FormNumberAbstractFieldWidget, NumberValue } from '../abstract/FormNumberAbstractFieldWidget';
import DefaultInteger from './DefaultInteger.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.Integer
  })
)
export class FormIntegerFieldWidget<
  Value extends NumberValue | NumberValue[] = NumberValue
> extends FormNumberAbstractFieldWidget<Value> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultInteger);
    return this;
  }

  @Widget.Reactive()
  protected get min(): string | number | undefined {
    if (stringIsAllNum(this.getDsl().min)) {
      return this.getDsl().min;
    }
    let dslMin = this.executeExpression<string | number>(this.getDsl().min);
    if (isNumber(dslMin)) {
      return dslMin;
    }
    if (isEmpty(dslMin)) {
      dslMin = toString(this.field.min);
      if (isEmpty(dslMin)) {
        dslMin = this.computeNumericFieldMin(this.size, this.precision);
      }
    }
    return dslMin;
  }

  @Widget.Reactive()
  protected get max(): string | number | undefined {
    if (stringIsAllNum(this.getDsl().max)) {
      return this.getDsl().max;
    }
    let dslMax = this.executeExpression<string | number>(this.getDsl().max);
    if (isNumber(dslMax)) {
      return dslMax;
    }
    if (isString(dslMax)) {
      if (isEmpty(dslMax)) {
        dslMax = toString(this.field.max);
        if (isEmpty(dslMax)) {
          dslMax = this.computeNumericFieldMax(this.size, this.precision);
        }
      }
    } else if (isNil(dslMax)) {
      dslMax = this.computeNumericFieldMax(this.size, this.precision);
    }
    return dslMax;
  }

  @Widget.Reactive()
  protected get step() {
    return this.getDsl().step;
  }

  @Widget.Reactive()
  protected minSafeInteger: string | number = '-9223372036854775808';

  @Widget.Reactive()
  protected maxSafeInteger: string | number = '9223372036854775807';

  @Widget.Reactive()
  protected get addStep() {
    return this.getDsl().addStep;
  }

  @Widget.Reactive()
  protected get reduceStep() {
    return this.getDsl().reduceStep;
  }

  @Widget.Reactive()
  protected get unit(): string | undefined {
    return this.executeExpression<string>(this.getDsl().unit);
  }

  @Widget.Reactive()
  protected get autocorrection() {
    return Optional.ofNullable(this.getDsl().autocorrection)
      .map((v) => BooleanHelper.toBoolean(v))
      .orElse(false);
  }

  public validator(): Promise<ValidatorInfo> {
    return super.validator().then((res) => {
      if (!isValidatorSuccess(res)) {
        return res;
      }
      const { value } = this;
      res = this.checkValue(value, res);
      if (!isValidatorSuccess(res)) {
        return res;
      }
      const realValue = toString(value);
      if (isEmpty(realValue)) {
        return res;
      }
      const num = new BigNumber(realValue);
      if (!num.isInteger()) {
        return this.validatorError(translateValueByKey('输入的不是一个整数'));
      }
      return res;
    });
  }

  public rawValidator(): Promise<ValidatorInfo> {
    return super.validator();
  }

  protected checkValue(singleValue, res) {
    if (isNil(singleValue)) {
      return res;
    }
    const num = new BigNumber(singleValue);
    if (num.isNaN()) {
      return this.validatorError(translateValueByKey('输入的不是一个数字'));
    }
    const realMinValue = fetchRealValue(this.min, this.minSafeInteger);
    if (!isNil(realMinValue) && num.comparedTo(realMinValue.value) < 0) {
      return this.validatorError(
        realMinValue.isSafeInteger
          ? `${translateValueByKey('不能输入超过最小安全值的数')}${this.minSafeInteger}`
          : `${translateValueByKey('不能小于')}${realMinValue.value}${translateValueByKey('最小值')}`
      );
    }
    const realMaxValue = fetchRealValue(this.max, this.maxSafeInteger);
    if (!isNil(realMaxValue) && num.comparedTo(realMaxValue.value) > 0) {
      return this.validatorError(
        realMaxValue.isSafeInteger
          ? `${translateValueByKey('不能输入超过最大安全值的数')}${this.maxSafeInteger}`
          : `${translateValueByKey('不能大于')}${realMaxValue.value}${translateValueByKey('最大值')}`
      );
    }
    return res;
  }

  /**
   * 以下方法根据数字的长度精度计算最大值最小值
   */
  private computeNumericFieldMax(size, precision): string {
    if (isNil(size)) {
      return toString(this.maxSafeInteger);
    }
    let finalResult = this._computeNumericFieldMax(size, precision) as BigNumber;
    const finalMax = new BigNumber(this.maxSafeInteger);
    if (finalMax !== null && finalMax.comparedTo(finalResult) < 0) {
      finalResult = finalMax;
    }
    return finalResult.toString();
  }

  private computeNumericFieldMin(size, precision): string {
    if (isNil(size)) {
      return toString(this.minSafeInteger);
    }
    let finalResult = new BigNumber(0).minus(this._computeNumericFieldMax(size, precision));
    const finalMin = new BigNumber(this.minSafeInteger);
    if (finalMin != null && finalMin.comparedTo(finalResult) > 0) {
      finalResult = finalMin;
    }
    return finalResult.toString();
  }

  private _computeNumericFieldMax(size, precision): BigNumber {
    const fieldSize = size as number;
    let fieldDecimal = precision as number;
    if (isNil(fieldSize)) {
      return new BigNumber(0);
    }
    if (isNil(fieldDecimal)) {
      fieldDecimal = 0;
    }
    let finalResult = new BigNumber(10).pow(fieldSize - fieldDecimal) as BigNumber;
    finalResult = finalResult.minus(new BigNumber('0.1').pow(fieldDecimal));
    return finalResult;
  }
}
