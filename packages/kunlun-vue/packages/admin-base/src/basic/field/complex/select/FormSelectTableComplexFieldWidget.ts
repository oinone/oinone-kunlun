import { ActiveRecords, RuntimeModelField, RuntimeRelationField } from '@oinone/kunlun-engine';
import { StringHelper } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { SelectTable } from '../../../../components';
import { FormSelectComplexFieldWidget } from './FormSelectComplexFieldWidget';

export abstract class FormSelectTableComplexFieldWidget<
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

  /**
   * 选项字段列表，每一项都是对应的字段元数据
   */
  @Widget.Reactive()
  protected get optionFieldList(): RuntimeModelField[] {
    if (!this.referencesModel) {
      return [];
    }
    let columnFields: string[] | undefined = StringHelper.convertArray(this.getDsl().columnFields as string);
    if (!columnFields?.length) {
      columnFields = this.referencesModel.labelFields;
    }
    if (!columnFields?.length) {
      console.error('Invalid column fields.');
      return [];
    }
    const modelFields = this.referencesModel.modelFields || [];
    const fieldMap = new Map<string, RuntimeModelField>(modelFields.map((f) => [f.name, f]));
    const fields: RuntimeModelField[] = [];
    for (const columnField of columnFields) {
      const field = fieldMap.get(columnField);
      if (field) {
        fields.push(field);
      }
    }
    return fields;
  }
}
