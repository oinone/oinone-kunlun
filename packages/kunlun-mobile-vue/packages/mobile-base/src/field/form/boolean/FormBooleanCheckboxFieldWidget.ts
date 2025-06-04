import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import CheckboxCom from './Checkbox.vue';
import { Widget } from '@oinone/kunlun-vue-widget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search, ViewType.Detail],
    ttype: ModelFieldType.Boolean,
    widget: ['Checkbox']
  })
)
export class FormBooleanCheckboxFieldWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(CheckboxCom);
    // this.change(false);
    return this;
  }

  @Widget.Reactive()
  public get showAllowClear() {
    return false;
  }
}
