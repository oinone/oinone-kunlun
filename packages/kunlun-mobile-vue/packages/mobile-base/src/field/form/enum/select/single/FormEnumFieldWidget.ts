import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { EnumerationValue } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../../basic';
import { FormEnumFieldAbstractWidget } from '../../FormEnumFieldAbstractWidget';
import EnumSelect from './EnumSelect.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: [ModelFieldType.Enum],
    multi: false
  })
)
export class FormEnumFieldWidget<
  Value extends EnumerationValue | EnumerationValue[] = EnumerationValue
> extends FormEnumFieldAbstractWidget<Value> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(EnumSelect);
    return this;
  }

  @Widget.Reactive()
  public get isLink() {
    return !this.readonly && true;
  }
}
