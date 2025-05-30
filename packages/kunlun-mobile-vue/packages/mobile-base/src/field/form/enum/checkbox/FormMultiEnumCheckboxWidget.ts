import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { ValidatorInfo } from '../../../../typing';
import { EnumerationValue, FormEnumFieldAbstractWidget } from '../FormEnumFieldAbstractWidget';
import MultiEnumCheckbox from './MultiEnumCheckbox.vue';
import { Widget } from '@kunlun/vue-widget';
import { isNil } from 'lodash-es';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.Enum,
    widget: 'Checkbox',
    multi: true
  })
)
export class FormMultiEnumCheckboxWidget extends FormEnumFieldAbstractWidget<EnumerationValue[]> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(MultiEnumCheckbox);
    return this;
  }

  public async validator(): Promise<ValidatorInfo> {
    return super.validator();
  }

  @Widget.Provide()
  @Widget.Reactive()
  public get value() {
    return super.value && super.value?.length === 0 ? null : super.value;
  }

  @Widget.Reactive()
  public get showCheckAll() {
    const { showCheckAll } = this.getDsl();
    return isNil(showCheckAll) ? false : showCheckAll;
  }

  @Widget.Reactive()
  public get shape() {
    const { shape } = this.getDsl();
    return isNil(shape) ? 'square' : shape;
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
