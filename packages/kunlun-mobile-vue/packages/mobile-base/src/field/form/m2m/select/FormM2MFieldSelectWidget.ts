import { ActiveRecord, RuntimeM2MField, SubmitHandler, SubmitValue } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget, FormSelectComplexFieldWidget } from '../../../../basic';
import SelectWidget from './SelectWidget.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToMany,
    widget: 'Select'
  })
)
export class FormM2MFieldSelectWidget extends FormSelectComplexFieldWidget<ActiveRecord[], RuntimeM2MField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(SelectWidget);
    return this;
  }

  @Widget.Method()
  public change(value) {
    if (value == null) {
      super.change(value);
      this.handleEmpty();
    } else {
      if (!value.length) {
        this.handleEmpty();
      }
      const submitData = value.map((item) => {
        return this.dataList.find((d) => d[this.relationFieldKey] === item.value);
      });
      super.change(submitData);
    }
  }

  protected async fillOptions(dataList: Record<string, unknown>[], insetDefaultValue = true) {
    await super.fillOptionsForMulti(dataList);
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value } = this;
    return SubmitHandler.M2M(field, itemName, submitValue, value);
  }

  protected async mounted() {
    await super.mounted();
    await this.loadOriginValue();
  }

  @Widget.Reactive()
  public get fieldValueOverflowHidden() {
    return true;
  }

  @Widget.Reactive()
  public get isLink() {
    return true;
  }
}
