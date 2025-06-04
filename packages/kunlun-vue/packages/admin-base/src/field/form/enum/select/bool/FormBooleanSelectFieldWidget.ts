import { RuntimeEnumerationOption, SubmitHandler, SubmitValue, translateValueByKey } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { toString } from 'lodash-es';
import { FormFieldWidget } from '../../../../../basic';
import { EnumerationValue } from '../../FormEnumFieldAbstractWidget';
import { FormEnumFieldWidget } from '../single';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: [ModelFieldType.Boolean],
    widget: 'Select'
  })
)
export class FormBooleanSelectFieldWidget extends FormEnumFieldWidget<EnumerationValue | EnumerationValue[]> {
  @Widget.Reactive()
  public get value() {
    const value = super.value;
    if (value != null) {
      return toString(value);
    }
    return value;
  }

  protected getAvailableOptions(): RuntimeEnumerationOption[] {
    const boolOptions = super.getAvailableOptions();
    if (!boolOptions || !boolOptions.length || boolOptions.length === 0) {
      return [
        {
          label: translateValueByKey('是'),
          displayName: translateValueByKey('是'),
          value: 'true',
          name: 'true'
        },
        {
          label: translateValueByKey('否'),
          displayName: translateValueByKey('否'),
          value: 'false',
          name: 'false'
        }
      ];
    }
    return boolOptions;
  }

  protected getMetaOptionNames() {
    return ['true', 'false'];
  }

  @Widget.Method()
  public change(val: EnumerationValue | EnumerationValue[] | null | undefined) {
    if (val == null) {
      super.change(val);
    }
    if (Array.isArray(val)) {
      super.change(val.map((v) => BooleanHelper.toBoolean(v)) as EnumerationValue[]);
    } else {
      super.change(BooleanHelper.toBoolean(val));
    }
  }

  public submit(submitValue: SubmitValue) {
    return SubmitHandler.BOOLEAN(this.field, this.itemName, submitValue, this.value);
  }
}

/**
 * @deprecated please using FormBooleanSelectFieldWidget
 */
export const FormEnumBoolFieldSelectWidget = FormBooleanSelectFieldWidget;
