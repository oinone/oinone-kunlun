import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ActiveRecord, RuntimeM2MField, SubmitHandler, SubmitValue } from '@oinone/kunlun-engine';
import { FormFieldWidget, FormSelectTableComplexFieldWidget } from '../../../../../basic';
import { SelectTableMode } from '../../../../../typing';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToMany,
    widget: 'SelectTable'
  })
)
export class FormM2MSelectTableFieldWidget extends FormSelectTableComplexFieldWidget<ActiveRecord[], RuntimeM2MField> {
  @Widget.Reactive()
  protected selectMode = SelectTableMode.Multiple;

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value } = this;
    return SubmitHandler.M2M(field, itemName, submitValue, value);
  }

  protected async mounted() {
    await this.loadOriginValue();
  }
}
