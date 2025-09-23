import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ActiveRecord, RuntimeM2MField, SubmitHandler, SubmitValue } from '@oinone/kunlun-engine';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { FormFieldWidget, FormSelectModalComplexFieldWidget } from '../../../../../basic';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToMany,
    widget: 'SelectModal'
  })
)
export class FormM2MSelectModalFieldWidget extends FormSelectModalComplexFieldWidget<ActiveRecord[], RuntimeM2MField> {
  @Widget.Reactive()
  protected get selectMode() {
    return SelectMode.multiple;
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value } = this;
    return SubmitHandler.M2M(field, itemName, submitValue, value);
  }

  protected filterX2mChangeValue(value: any) {
    return value;
  }

  protected async mounted() {
    await this.loadOriginValue();
  }
}
