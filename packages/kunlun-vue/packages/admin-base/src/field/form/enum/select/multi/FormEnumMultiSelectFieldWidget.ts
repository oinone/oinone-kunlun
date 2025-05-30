import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../../basic';
import { EnumerationValue, FormEnumFieldAbstractWidget } from '../../FormEnumFieldAbstractWidget';
import MultiEnumSelect from './MultiEnumSelect.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.Enum,
    multi: true
  })
)
export class FormEnumMultiSelectFieldWidget extends FormEnumFieldAbstractWidget<EnumerationValue[]> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(MultiEnumSelect);
    return this;
  }
}

export const FormMultiEnumFieldWidget = FormEnumMultiSelectFieldWidget;
