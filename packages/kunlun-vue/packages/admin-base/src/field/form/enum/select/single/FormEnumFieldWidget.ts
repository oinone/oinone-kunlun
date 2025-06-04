import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../../basic';
import { EnumerationValue, FormEnumFieldAbstractWidget } from '../../FormEnumFieldAbstractWidget';
import EnumSelect from './EnumSelect.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.Enum
  })
)
export class FormEnumFieldWidget<
  Value extends EnumerationValue | EnumerationValue[] = EnumerationValue
> extends FormEnumFieldAbstractWidget<Value> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(EnumSelect);
    return this;
  }
}
