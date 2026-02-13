import {
  type ActiveRecord,
  type ActiveRecords,
  isEnumerationField,
  isRelationField,
  type RuntimeModelField,
  type RuntimeRelationField
} from '@oinone/kunlun-engine';
import { StringHelper } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { get as getValue } from 'lodash-es';
import { TableSelect, TableSelectColumn } from '../../../../components';
import { SelectFieldWidget } from './SelectFieldWidget';

export abstract class TableSelectFieldWidget<
  Option extends ActiveRecord = ActiveRecord,
  Value extends ActiveRecords = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField
> extends SelectFieldWidget<Option, Value, Field> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(TableSelect);
    return this;
  }

  @Widget.Reactive()
  protected get tableSelectColumns(): TableSelectColumn[] {
    if (!this.referencesModel) {
      return [];
    }
    let columnFields: string[] | undefined = StringHelper.convertArray(this.getDsl().columnFields as string);
    if (!columnFields?.length) {
      columnFields = this.labelFields;
    }
    if (!columnFields.length) {
      console.error('Invalid column fields.');
      return [];
    }
    const modelFields = this.referencesModel.modelFields || [];
    const fieldMap = new Map<string, RuntimeModelField>(modelFields.map((f) => [f.data, f]));
    const columns: TableSelectColumn[] = [];
    let index = 0;
    for (const columnField of columnFields) {
      const ss = columnField.split('.');
      const field = fieldMap.get(ss[0]);
      if (!field) {
        continue;
      }
      if (ss.length === 1) {
        const { data, name, label } = field;
        const column: TableSelectColumn = {
          key: `${data}-${index}`,
          label: label || data,
          field: name
        };
        this.generatorColumnRender(column, field);
        columns.push(column);
      } else if (isRelationField(field)) {
        const fields = this.getColumnFields(field, ss);
        if (fields) {
          const lastField = fields[fields.length - 1];
          const label = fields.map((v) => v.label || v.data).join(' - ');
          const field = fields.map((v) => v.name).join('.');
          const column: TableSelectColumn = {
            key: `${field}-${index}`,
            label,
            field
          };
          this.generatorColumnRender(column, lastField);
          columns.push(column);
        }
      }
      index++;
    }
    return columns;
  }

  protected generatorColumnRender(column: TableSelectColumn, runtimeField: RuntimeModelField) {
    const { field } = column;
    if (isEnumerationField(runtimeField)) {
      const mapping: Record<string, string> = {};
      for (const option of runtimeField.options) {
        mapping[option.name] = option.label || option.displayName || option.name;
      }
      column.renderDefaultSlot = (context) => {
        const value = getValue(context.data, field);
        if (value == null) {
          return undefined;
        }
        const stringValue = `${value}`;
        const displayValue = mapping[stringValue];
        return displayValue || stringValue;
      };
    }
  }

  protected getColumnFields(field: RuntimeRelationField, keys: string[]): RuntimeModelField[] | undefined {
    const fields: RuntimeModelField[] = [field];
    let lastField: RuntimeModelField | undefined;
    for (let i = 1; i < keys.length; i++) {
      const key = keys[i];
      if (i === 1) {
        lastField = field.referencesModel.modelFields.find((v) => v.data === key);
        if (!lastField) {
          return undefined;
        }
      } else if (lastField && isRelationField(lastField)) {
        lastField = lastField.referencesModel.modelFields.find((v) => v.data === key);
        if (!lastField) {
          return undefined;
        }
      } else {
        return undefined;
      }
      fields.push(lastField);
    }
    return fields;
  }
}
