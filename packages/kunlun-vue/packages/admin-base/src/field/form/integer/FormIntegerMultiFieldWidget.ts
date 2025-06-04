import { translateValueByKey } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { get as getValue } from 'lodash-es';
import { FormFieldWidget } from '../../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../../typing';
import { NumberValue } from '../abstract/FormNumberAbstractFieldWidget';
import Tag from '../string/tag/Tag.vue';
import { FormIntegerFieldWidget } from './FormIntegerFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: [ModelFieldType.Integer],
    multi: true
  })
)
export class FormIntegerMultiFieldWidget extends FormIntegerFieldWidget<NumberValue[]> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Tag);
    return this;
  }

  @Widget.Reactive()
  protected get inputRegular() {
    return this.getDsl().inputRegular || /[^\d]/g;
  }

  @Widget.Reactive()
  private get limit() {
    const _limit = this.field.limit || this.getDsl().limit;
    if (_limit) {
      return _limit;
    }
    return 0;
  }

  @Widget.Reactive()
  private get allowRepeat() {
    const _allowRepeat = this.getDsl().allowRepeat;
    if (_allowRepeat) {
      return _allowRepeat;
    }
    return false;
  }

  @Widget.Reactive()
  private get unitValueLength() {
    return this.getDsl().unitValueLength || getValue(this.field, 'attributes.unitValueLength');
  }

  public async validator(): Promise<ValidatorInfo> {
    const res = await this.validatorSpecific(this.value);
    if (!isValidatorSuccess(res)) {
      return res;
    }
    if (this.value && this.value.length) {
      if (this.limit && this.value.length > this.limit) {
        return this.validatorError(`${translateValueByKey('超出标签最大个数')}:${this.limit}`);
      }
      for (let i = 0; i < this.value.length; i++) {
        const checkRes = this.checkValue(this.value[i], res);
        if (!isValidatorSuccess(checkRes)) {
          return checkRes;
        }
      }
    }
    return res;
  }

  @Widget.Method()
  public tagChange(value) {
    if (Array.isArray(value) && value.length === 0) {
      value = null;
    }
    this.change(value);
    this.blur();
  }
}
