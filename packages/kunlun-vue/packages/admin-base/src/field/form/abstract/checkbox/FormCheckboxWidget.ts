import { RuntimeEnumerationOption, RuntimeModelField } from '@kunlun/engine';
import { BooleanHelper } from '@kunlun/shared';
import { WidgetTrigger } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic/field/FormFieldWidget';

export type EnumerationValue = boolean | string;

export abstract class FormCheckboxWidget<
  Value extends EnumerationValue | EnumerationValue[] = EnumerationValue | EnumerationValue[],
  Field extends RuntimeModelField = RuntimeModelField
> extends FormFieldWidget<Value, Field> {
  protected abstract getAvailableOptions(): RuntimeEnumerationOption[];

  @Widget.Reactive()
  protected get options(): RuntimeEnumerationOption[] {
    return this.getAvailableOptions();
  }

  @Widget.Reactive()
  protected get autocorrection() {
    return BooleanHelper.toBoolean(this.getDsl().autocorrection);
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
  protected get maxNumber() {
    const _maxNumber = this.getDsl().maxNumber;
    if (_maxNumber) {
      return _maxNumber;
    }
    return Infinity;
  }

  @Widget.Reactive()
  protected get minNumber() {
    const _minNumber = this.getDsl().minNumber;
    if (_minNumber) {
      return _minNumber;
    }
    return -Infinity;
  }

  protected defaultConstructDataTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  protected defaultClearFieldsTrigger() {
    return [WidgetTrigger.CHANGE];
  }
}
