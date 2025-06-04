import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../../basic';
import { EnumerationValue, FormEnumFieldAbstractWidget } from '../../FormEnumFieldAbstractWidget';
import MultiEnumSelect from './MultiEnumSelect.vue';
import { Widget } from '@oinone/kunlun-vue-widget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.Enum,
    /* widget: 'Select', */
    multi: true
  })
)
export class FormMultiEnumFieldWidget extends FormEnumFieldAbstractWidget<EnumerationValue[]> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(MultiEnumSelect);
    return this;
  }

  @Widget.Reactive()
  public get isLink() {
    return !this.readonly && true;
  }

  @Widget.Reactive()
  public get fieldValueOverflowHidden() {
    return true;
  }
}
