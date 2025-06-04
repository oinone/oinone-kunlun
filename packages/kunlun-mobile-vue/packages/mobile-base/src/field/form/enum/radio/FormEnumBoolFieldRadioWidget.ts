import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { EnumerationValue } from '../FormEnumFieldAbstractWidget';
import { FormEnumBoolFieldSelectWidget } from '../select/bool/FormEnumBoolFieldSelectWidget';
import FormEnumRadio from './FormEnumRadio.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: [ModelFieldType.Boolean]
  })
)
export class FormEnumBoolFieldRadioWidget extends FormEnumBoolFieldSelectWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(FormEnumRadio);
    return this;
  }

  @Widget.Reactive()
  protected get rowLimit() {
    return this.getDsl().rowLimit;
  }

  @Widget.Method()
  public change(val: EnumerationValue | EnumerationValue[] | null | undefined) {
    super.change(val);
  }

  @Widget.Reactive()
  public get showAllowClear() {
    return false;
  }

  @Widget.Reactive()
  public get isLink() {
    return false;
  }
}
