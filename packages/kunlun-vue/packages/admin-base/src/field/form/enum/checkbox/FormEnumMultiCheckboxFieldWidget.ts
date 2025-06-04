import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { ValidateTrigger } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { ValidatorInfo } from '../../../../typing';
import { FormEnumFieldAbstractWidget } from '../FormEnumFieldAbstractWidget';
import MultiEnumCheckbox from './MultiEnumCheckbox.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.Enum,
    widget: 'Checkbox',
    multi: true
  })
)
export class FormEnumMultiCheckboxFieldWidget extends FormEnumFieldAbstractWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(MultiEnumCheckbox);
    return this;
  }

  @Widget.Reactive()
  public get validateTrigger(): ValidateTrigger[] {
    return [ValidateTrigger.CHANGE];
  }
}

/**
 * @deprecated please using FormEnumMultiCheckboxFieldWidget
 */
export const FormMultiEnumCheckboxWidget = FormEnumMultiCheckboxFieldWidget;
