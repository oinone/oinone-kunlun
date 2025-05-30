import { RuntimeStringField, translateValueByKey } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';

import { get as getValue } from 'lodash-es';
import { BaseFieldWidget, FormFieldWidget } from '../../../../basic';
import Tag from './Tag.vue';
import { isValidatorSuccess, ValidatorInfo } from '../../../../typing';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search, ViewType.Detail],
    ttype: ModelFieldType.String,
    // widget: 'Tag',
    multi: true
  })
)
export class FormStringFieldMultiWidget extends FormFieldWidget<string, RuntimeStringField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Tag);
    return this;
  }

  @Widget.Reactive()
  protected get limit() {
    return this.field.limit;
  }

  @Widget.Reactive()
  protected get allowRepeat() {
    const _allowRepeat = this.getDsl().allowRepeat;
    if (_allowRepeat) {
      return _allowRepeat;
    }
    return false;
  }

  @Widget.Reactive()
  protected get unitValueLength() {
    return this.getDsl().unitValueLength || getValue(this.field, 'attributes.unitValueLength');
  }

  public async validator(): Promise<ValidatorInfo> {
    const res = await super.validator();
    if (!isValidatorSuccess(res)) {
      return res;
    }
    if (this.limit && this.value && this.value.length > 0) {
      if (this.limit && this.value.length > this.limit) {
        return this.validatorError(`${translateValueByKey('超出标签最大个数')} :${this.limit}`);
      }
    }
    return this.validatorSuccess();
  }

  @Widget.Method()
  public tagChange(value) {
    if (Array.isArray(value) && value.length === 0) {
      value = null;
    }
    this.change(value);
    this.blur();
  }

  @Widget.Reactive()
  public get fieldValueOverflowHidden() {
    return true;
  }
}
