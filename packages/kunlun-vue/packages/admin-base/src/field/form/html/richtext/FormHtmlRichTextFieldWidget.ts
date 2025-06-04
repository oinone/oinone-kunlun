import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { StyleHelper } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../../../typing';
import { FormStringFieldWidget } from '../../string';
import RichText from './RichText.vue';

@SPI.ClassFactory(FormFieldWidget.Token({ viewType: ViewType.Form, ttype: ModelFieldType.HTML }))
export class FormHtmlRichTextFieldWidget extends FormStringFieldWidget {
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

  @Widget.Reactive()
  protected get height(): string | undefined {
    return StyleHelper.px(this.getDsl().height);
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
}

/**
 * @deprecated please using FormHtmlRichTextFieldWidget
 */
export const FormHTMLRichTextFieldWidget = FormHtmlRichTextFieldWidget;
