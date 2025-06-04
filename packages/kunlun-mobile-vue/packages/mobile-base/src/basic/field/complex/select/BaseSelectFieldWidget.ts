import { ActiveRecord, ActiveRecords, ActiveRecordsOperator, RuntimeRelationField } from '@oinone/kunlun-engine';
import { StringHelper } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormComplexFieldProps, FormComplexFieldWidget } from '../FormComplexFieldWidget';

function isNull(value: ActiveRecords | null | undefined): value is null | undefined {
  return value == null;
}

function isActiveRecordArray(value: ActiveRecords): value is ActiveRecord[] {
  return Array.isArray(value);
}

export abstract class BaseSelectFieldWidget<
  Value extends ActiveRecords = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField,
  Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
> extends FormComplexFieldWidget<Value, Field, Props> {
  @Widget.Reactive()
  public get labelFields(): string[] {
    return this.referencesModel?.labelFields || [];
  }

  @Widget.Reactive()
  public get searchFields(): string[] {
    return StringHelper.convertArray(this.getDsl().searchFields) || this.labelFields;
  }

  @Widget.Reactive()
  public get separator() {
    return this.getDsl().separator || ',';
  }

  @Widget.Reactive()
  protected get optionLabel() {
    const _optionLabel = this.getDsl().optionLabel;
    if (_optionLabel) {
      return _optionLabel;
    }
    return '';
  }

  @Widget.Reactive()
  protected get optionLabelContextArgs() {
    const _optionLabelContextArgs = this.getDsl().optionLabelContextArgs;
    if (_optionLabelContextArgs) {
      return _optionLabelContextArgs;
    }
    return '';
  }

  protected mountedProcess() {
    const { value } = this;
    const isMulti = this.field.multi;
    if (isMulti == null) {
      if (isNull(value)) {
        this.dataSource = [];
      } else {
        this.dataSource = ActiveRecordsOperator.repairRecords(value);
      }
    } else if (isMulti) {
      if (isNull(value)) {
        this.dataSource = [];
      } else if (isActiveRecordArray(value)) {
        this.dataSource = ActiveRecordsOperator.repairRecords(value);
      } else {
        this.dataSource = [];
      }
    } else if (isNull(value)) {
      this.dataSource = [];
    } else if (isActiveRecordArray(value)) {
      this.dataSource = ActiveRecordsOperator.repairRecords(value[0]);
    } else {
      this.dataSource = ActiveRecordsOperator.repairRecords(value);
    }
  }
}
