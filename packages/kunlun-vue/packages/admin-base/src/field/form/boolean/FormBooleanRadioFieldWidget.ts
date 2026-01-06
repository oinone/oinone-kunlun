import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import type { EnumerationValue } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic';
import FormEnumRadio from '../enum/radio/FormEnumRadio.vue';
import { FormBooleanSelectFieldWidget } from './FormBooleanSelectFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.Boolean,
    widget: 'Radio'
  })
)
export class FormBooleanRadioFieldWidget extends FormBooleanSelectFieldWidget {
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
  protected get rowLimit() {
    return this.getDsl().rowLimit;
  }

  @Widget.Method()
  public change(val: EnumerationValue | EnumerationValue[] | null | undefined) {
    super.change(val);
  }
}

/**
 * @deprecated please using FormBooleanRadioFieldWidget
 */
export const FormEnumBoolFieldRadioWidget = FormBooleanRadioFieldWidget;
