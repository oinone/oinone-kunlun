import { RuntimeM2MField, SubmitHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../basic/field/FormFieldWidget';
import { DefaultCheckbox, FormRelationFieldCheckboxWidget } from '../../abstract/checkbox';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToMany,
    widget: 'Checkbox'
  })
)
export class FormM2MCheckboxFieldWidget extends FormRelationFieldCheckboxWidget<RuntimeM2MField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultCheckbox);
    return this;
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value } = this;
    return SubmitHandler.M2M(field, itemName, submitValue, value);
  }
}
