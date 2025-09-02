import { ActiveRecord, RuntimeM2MField, SubmitHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget, FormSelectComplexFieldWidget } from '../../../../basic';
import SelectWidget from './SelectWidget.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToMany
  })
)
export class FormM2MFieldSelectWidget extends FormSelectComplexFieldWidget<ActiveRecord[], RuntimeM2MField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(SelectWidget);
    return this;
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
