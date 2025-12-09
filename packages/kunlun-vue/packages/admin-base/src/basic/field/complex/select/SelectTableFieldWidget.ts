import { ActiveRecords, isEnumerationField, RuntimeModelField, RuntimeRelationField } from '@oinone/kunlun-engine';
import { StringHelper } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { SelectTable } from '../../../../components';
import { FormSelectComplexFieldWidget } from './FormSelectComplexFieldWidget';

/**
 * 同 oio-column 组件的 props
 */
export interface SelectTableColumn extends Record<string, any> {
  key: string;
  label: string;
  field: string;
  filters?: { value: string; label: string }[];
}

export abstract class SelectTableFieldWidget<
  Value extends ActiveRecords = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField
> extends FormSelectComplexFieldWidget<Value, Field> {
  public initialize(props: any) {
    super.initialize(props);
    this.setComponent(SelectTable);
    return this;
  }

  @Widget.Method()
  public getDataList() {
    return this.dataList;
  }

  @Widget.Method()
  public change(value) {
    if (this.field.multi) {
      this.x2mChange(value);
    } else {
      this.x2oChange(value);
    }
  }

  @Widget.Reactive()
  protected get optionColumns(): SelectTableColumn[] {
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
    const columns: SelectTableColumn[] = [];
    let index = 0;
    for (const columnField of columnFields) {
      const field = fieldMap.get(columnField);
      if (field) {
        const { data, name, label } = field;
        const column: SelectTableColumn = {
          key: `${data}-${index}`,
          label: label || data,
          field: name
        };
        if (isEnumerationField(field)) {
          column.filters = field.options.map((v) => ({
            value: `${v.value}`,
            label: v.name
          }));
        }
        columns.push(column);
      }
      index++;
    }
    return columns;
  }
}
