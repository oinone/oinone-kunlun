import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget, FormSelectComplexFieldWidget } from '../../../../basic';
import SelectWidget from './SelectWidget.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.OneToMany
  })
)
export class FormO2MSelectFieldWidget extends FormSelectComplexFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(SelectWidget);
    return this;
  }

  @Widget.Method()
  public change(value) {
    this.x2mChange(value);
  }

  protected async mounted() {
    await super.mounted();
    await this.loadOriginValue();
  }
}

/**
 * @deprecated please using FormO2MSelectFieldWidget
 */
export const FormO2MFieldSelectWidget = FormO2MSelectFieldWidget;
