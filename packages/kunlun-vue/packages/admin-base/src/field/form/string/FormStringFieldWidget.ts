import { RuntimeStringField, translateValueByKey } from '@kunlun/engine';
import { isEmptyValue } from '@kunlun/meta';
import { InputType } from '@kunlun/vue-ui-antd';
import { Widget } from '@kunlun/vue-widget';

import { isNil, isNumber } from 'lodash-es';
import { isValidatorSuccess, ValidatorInfo } from '../../../typing';
import { FormInputAbstractFieldWidget } from '../abstract/FormInputAbstractFieldWidget';
import FormString from './DefaultString.vue';

/**
 * 字符串输入组件公共基础类
 */
export class FormStringFieldWidget extends FormInputAbstractFieldWidget<string, RuntimeStringField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(FormString);
    return this;
  }

  @Widget.Reactive()
  protected get maxLength() {
    const _maxLength = this.getDsl().maxLength;
    if (_maxLength) {
      const calLength = this.getLimitLength('maxLength');
      if (isNumber(calLength)) {
        return calLength;
      }
    }
    if (this.field.store) {
      return this.field.max || this.field.size;
    }
    return _maxLength || 1024;
  }

  @Widget.Reactive()
  protected get minLength() {
    const _minLength = this.getDsl().minLength;
    if (_minLength) {
      return this.getLimitLength('minLength') || 0;
    }
    return this.field.min || 0;
  }

  @Widget.Reactive()
  protected get showCount() {
    const _showCounter = this.getDsl().showCount;
    if (_showCounter) {
      return _showCounter;
    }
    return false;
  }

  @Widget.Reactive()
  protected get patternType() {
    const _patternType = this.getDsl().patternType;
    if (_patternType) {
      return this.executeExpression(_patternType);
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get pattern() {
    const _pattern = this.getDsl().pattern;
    if (_pattern) {
      return _pattern;
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get clearSetEmpty() {
    const _clearSetEmpty = this.getDsl().clearSetEmpty;
    if (isNil(_clearSetEmpty)) {
      return true;
    }
    return _clearSetEmpty || false;
  }

  @Widget.Reactive()
  protected get crypto() {
    return this.getDsl().crypto || false;
  }

  @Widget.Reactive()
  protected get visibleIcon() {
    return this.getDsl().visibleIcon || 'oinone-visible';
  }

  @Widget.Reactive()
  protected get invisibleIcon() {
    return this.getDsl().invisibleIcon || 'oinone-invisible';
  }

  @Widget.Reactive()
  protected get type() {
    const _type = this.executeExpression(this.getDsl().type, InputType.TEXT);
    if (_type) {
      return _type;
    }
    return InputType.TEXT;
  }

  @Widget.Reactive()
  protected getLimitLength(type: 'maxLength' | 'minLength') {
    const dslSize = this.getDsl()[type] as string;
    if (dslSize && dslSize.length) {
      const res = this.executeExpression(dslSize as string, 0) as number;
      return Math.floor(res);
    }
    return null;
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

  protected validateLength(realValue: string | undefined): ValidatorInfo {
    const length = !isNil(realValue) ? realValue.length : 0;
    const { minLength, maxLength } = this;
    if (!isEmptyValue(realValue) && !isNil(maxLength) && length > maxLength) {
      return this.validatorError(`${translateValueByKey('最大长度为')}${maxLength}`);
    }
    if (!isEmptyValue(realValue) && !isNil(minLength) && length < minLength) {
      return this.validatorError(`${translateValueByKey('最小长度为')}${minLength}`);
    }
    return this.validatorSuccess();
  }

  @Widget.Method()
  public change(value) {
    let val = value;

    if (!value) {
      val = null;
    }

    super.change(val);
  }
}
