import { RuntimeM2OField, SubmitHandler, SubmitValue } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic/field/FormFieldWidget';
import { DefaultRadio, FormRelationFieldRadioWidget } from '../../abstract/radio';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToOne,
    widget: 'Radio'
  })
)
export class FormM2ORadioFieldWidget extends FormRelationFieldRadioWidget<RuntimeM2OField> {
  @Widget.Reactive()
  protected selectedValues: string[] | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultRadio);
    return this;
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value } = this;
    return SubmitHandler.M2O(field, itemName, submitValue, value);
  }
}
