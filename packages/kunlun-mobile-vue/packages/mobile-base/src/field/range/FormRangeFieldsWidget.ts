import { RuntimeModelField } from '@kunlun/engine';
import { Widget } from '@kunlun/vue-widget';
import { isNil } from 'lodash-es';
import { BaseFormItemWidget, BaseFormItemWidgetProps } from '../../basic';
import { ValidatorInfo } from '../../typing';
import { findRangeFields } from '../util';

export type FormRangeWidgetProps = BaseFormItemWidgetProps;

export class FormRangeFieldsWidget<
  Value = unknown,
  Field extends RuntimeModelField = RuntimeModelField,
  Props extends FormRangeWidgetProps = FormRangeWidgetProps
> extends BaseFormItemWidget<[Value, Value], Props> {
  @Widget.Reactive()
  protected startField!: Field;

  @Widget.Reactive()
  protected endField!: Field;

  public initialize(props) {
    super.initialize(props);
    const { startField, endField } = findRangeFields(this.rootRuntimeContext, this.getDsl().widgets || []);
    if (!startField || !endField) {
      throw new Error('range widget StartField and EndField is required.');
    }
    this.startField = startField as Field;
    this.endField = endField as Field;

    // fixme @zbh 20230314 移除默认值赋值逻辑，应配置在对应字段上，界面设计器需要做相应调整
    const startFieldData = startField.data;
    if (!isNil(this.startDefaultValue) && isNil(this.formData[startFieldData])) {
      this.formData[startFieldData] = this.startDefaultValue;
    }
    const endFieldData = endField.data;
    if (!isNil(this.endDefaultValue) && isNil(this.formData[endFieldData])) {
      this.formData[endFieldData] = this.endDefaultValue;
    }
    return this;
  }

  @Widget.Reactive()
  public get itemData() {
    return super.itemData || `${this.startField.data}#${this.endField.data}`;
  }

  @Widget.Reactive()
  public get itemName() {
    return super.itemName || `${this.startField.name}#${this.endField.name}`;
  }

  @Widget.Reactive()
  protected get startDefaultValue() {
    return this.getDsl().startDefaultValue;
  }

  @Widget.Reactive()
  protected get endDefaultValue() {
    return this.getDsl().endDefaultValue;
  }

  public getValue(): [Value, Value] | null | undefined {
    const startData = this.formData[this.startField.data] as Value;
    const endData = this.formData[this.endField.data] as Value;
    if (startData === undefined && endData === undefined) {
      return undefined;
    }
    return [startData, endData];
  }

  public setValue(val: [Value, Value] | null | undefined) {
    if (val === undefined) {
      return;
    }
    let startVal: Value | null | undefined;
    let endVal: Value | null | undefined;
    if (val === null) {
      startVal = null;
      endVal = null;
    } else {
      [startVal, endVal] = val;
    }
    if (startVal !== undefined) {
      this.formData[this.startField.data] = startVal;
    }
    if (endVal !== undefined) {
      this.formData[this.endField.data] = endVal;
    }
  }

  public submit() {
    const { data: startFieldData, name: startFieldName } = this.startField;
    const { data: endFieldData, name: endFieldName } = this.endField;
    const res: Record<string, unknown> = {};
    const { [startFieldData]: startVal, [endFieldData]: endVal } = this.formData;
    if (startVal !== undefined) {
      res[startFieldName] = startVal;
    }
    if (endVal !== undefined) {
      res[endFieldName] = endVal;
    }
    return res;
  }

  public async validator(): Promise<ValidatorInfo> {
    const data = this.submit();
    if (!data || Object.values(data).some((v) => !v)) {
      if (this.required) {
        return this.validatorError();
      }
      return this.validatorSuccess();
    }
    return super.validator();
  }
}
