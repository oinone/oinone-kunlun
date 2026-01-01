import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import type { EnumerationValue } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../../basic';
import { FormEnumFieldAbstractWidget } from '../../FormEnumFieldAbstractWidget';
import MultiEnumSelect from './MultiEnumSelect.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.Enum,
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
