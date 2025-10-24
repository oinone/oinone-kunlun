import { ActiveRecord, RuntimeM2MField, SubmitHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget, FormSelectComplexFieldWidget } from '../../../../basic';
import DefaultMultipleSelect from '../../abstract/select/DefaultMultipleSelect.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToMany
  })
)
export class FormM2MSelectFieldWidget extends FormSelectComplexFieldWidget<ActiveRecord[], RuntimeM2MField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultMultipleSelect);
    return this;
  }

  @Widget.Method()
  public change(value) {
    this.x2mChange(value);
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value } = this;
    return SubmitHandler.M2M(field, itemName, submitValue, value);
  }

  protected async mounted() {
    await super.mounted();
    await this.loadOriginValue();
  }
}

export const FormM2MFieldSelectWidget = FormM2MSelectFieldWidget;
