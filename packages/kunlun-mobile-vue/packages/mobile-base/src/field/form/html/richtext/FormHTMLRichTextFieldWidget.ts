import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { BooleanHelper } from '@kunlun/shared';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { isValidatorSuccess, ValidatorInfo, ValidatorStatus } from '../../../../typing';
import { FormStringFieldWidget } from '../../string';
import RichText from './RichText.vue';

@SPI.ClassFactory(FormFieldWidget.Token({ viewType: [ViewType.Form], ttype: ModelFieldType.HTML }))
export class FormHTMLRichTextFieldWidget extends FormStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(RichText);
    return this;
  }

  @Widget.Reactive()
  protected get encode() {
    const _encode = this.getDsl().encode;
    if (_encode) {
      return BooleanHelper.toBoolean(_encode);
    }
    return false;
  }

  public async validator(): Promise<ValidatorInfo> {
    const checkValue = this.encode && this.value ? decodeURI(this.value) : this.value;
    const res = await this.validatorSpecific(checkValue);
    if (!isValidatorSuccess(res)) {
      return res;
    }
    if (checkValue == null) {
      return this.validatorSuccess();
    }
    return this.validateLength(checkValue);
  }

  @Widget.Method()
  public change(val) {
    if (this.encode) {
      super.change(encodeURI(val));
    } else {
      super.change(val);
    }
  }

  @Widget.Reactive()
  public get noBorderBottom() {
    return true;
  }

  @Widget.Reactive()
  public get showAllowClear() {
    return false;
  }

  @Widget.Reactive()
  public get fakeVertical() {
    return true;
  }
}
