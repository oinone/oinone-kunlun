import { ActiveRecord, RuntimeM2OField, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { debounce } from 'lodash-es';
import { FormFieldWidget, FormSelectComplexFieldWidget } from '../../../../basic';
import VueComponent from './SelectWidget.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToOne
  })
)
export class FormM2OSelectFieldWidget extends FormSelectComplexFieldWidget<ActiveRecord, RuntimeM2OField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(VueComponent);
    return this;
  }

  @Widget.Reactive()
  protected currentValueLabel!: string;

  @Widget.Method()
  public async handleSelectedValueLabel(val) {
    this.currentValueLabel = this.handleSelectOption([val], this.referencesModel)[0]?.label as string;
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value, viewMode, submitCache, submitType, relationUpdateType } = this;
    return SubmitRelationHandler.M2O(
      field,
      itemName,
      submitValue,
      value,
      viewMode,
      submitCache,
      submitType,
      relationUpdateType
    );
  }

  protected async mounted() {
    await super.mounted();
    if (this.value) {
      this.watchValue();
    }
  }

  @Widget.Provide()
  @Widget.Reactive()
  public get value() {
    if (this.formData) {
      return this.getValue();
    }
    return undefined;
  }

  public m2oChange(value: Record<string, unknown>) {
    super.change(value);
  }

  @Widget.Watch('formData', { deep: true })
  public async watchM2OValue() {
    this.delayUpdateM2oValue();
  }

  public delayUpdateM2oValue = debounce(() => {
    this.updateM2oValue();
  });
}
