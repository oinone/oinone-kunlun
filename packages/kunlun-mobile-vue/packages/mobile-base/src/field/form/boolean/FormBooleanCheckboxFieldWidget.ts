import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic';
import CheckboxCom from './Checkbox.vue';
import { Widget } from '@kunlun/vue-widget';

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
