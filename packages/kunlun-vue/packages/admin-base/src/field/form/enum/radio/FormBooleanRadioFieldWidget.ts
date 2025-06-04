import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { EnumerationValue } from '../FormEnumFieldAbstractWidget';
import { FormBooleanSelectFieldWidget } from '../select';
import FormEnumRadio from './FormEnumRadio.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.Boolean,
    widget: 'Radio'
  })
)
export class FormBooleanRadioFieldWidget extends FormBooleanSelectFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(FormEnumRadio);
    return this;
  }

  @Widget.Reactive()
  protected get rowLimit() {
    return this.getDsl().rowLimit;
  }

  @Widget.Method()
  public change(val: EnumerationValue | EnumerationValue[] | null | undefined) {
    super.change(val);
  }
}

/**
 * @deprecated please using FormBooleanRadioFieldWidget
 */
export const FormEnumBoolFieldRadioWidget = FormBooleanRadioFieldWidget;
