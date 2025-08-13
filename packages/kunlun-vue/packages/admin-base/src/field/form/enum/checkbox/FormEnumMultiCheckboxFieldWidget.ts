import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { ValidateTrigger } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
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
  protected get orientation() {
    const _orientation = this.getDsl().orientation as string;
    if (_orientation) {
      return _orientation;
    }
    return undefined;
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
