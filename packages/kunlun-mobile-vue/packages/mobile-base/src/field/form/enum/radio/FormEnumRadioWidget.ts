import { ModelFieldType, ViewType } from '@kunlun/meta';
import { BooleanHelper, Optional } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { isNil } from 'lodash-es';
import { FormFieldWidget } from '../../../../basic';
import { EnumerationValue, FormEnumFieldAbstractWidget } from '../FormEnumFieldAbstractWidget';
import FormEnumRadio from './FormEnumRadio.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.Enum,
    widget: 'Radio'
  })
)
export class FormEnumRadioWidget extends FormEnumFieldAbstractWidget<EnumerationValue> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(FormEnumRadio);
    return this;
  }

  @Widget.Reactive()
  protected get allowClear() {
    const { allowClear } = this.getDsl();
    if (isNil(allowClear)) {
      return false;
    }
    return allowClear;
  }

  @Widget.Reactive()
  protected get autocorrection() {
    return Optional.ofNullable(this.getDsl().autocorrection)
      .map((v) => BooleanHelper.toBoolean(v))
      .orElse(false);
  }

  @Widget.Reactive()
  protected get rowLimit() {
    return this.getDsl().rowLimit;
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
