import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, EnumerationValue } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormEnumFieldAbstractWidget } from '../FormEnumFieldAbstractWidget';
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
  protected get orientation() {
    const _orientation = this.getDsl().orientation as string;
    if (_orientation) {
      return _orientation;
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get radioMode() {
    const _radioMode = this.getDsl().radioMode as string;
    if (_radioMode) {
      return _radioMode;
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get allowClear(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().allowClear) || false;
  }

  @Widget.Reactive()
  protected get autocorrection() {
    return BooleanHelper.toBoolean(this.getDsl().autocorrection) || false;
  }

  @Widget.Reactive()
  protected get rowLimit() {
    return this.getDsl().rowLimit;
  }
}
