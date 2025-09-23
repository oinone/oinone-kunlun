import { Widget } from '@oinone/kunlun-vue-widget';
import { ActiveRecords, RuntimeModelField, RuntimeRelationField } from '@oinone/kunlun-engine';
import { FormSelectComplexFieldWidget } from './FormSelectComplexFieldWidget';
import { SelectTable } from '../../../../components';

export abstract class FormSelectTableComplexFieldWidget<
  Value extends ActiveRecords = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField
> extends FormSelectComplexFieldWidget<Value, Field> {
  public initialize(props: any) {
    super.initialize(props);
    this.setComponent(SelectTable);
    return this;
  }

  /**
   * 解析选项标题
   */
  public parseOptionLabelStr(str) {
    const names: string[] = [];
    str.split('+').forEach((s) => {
      const match = s.match(/\.(\w+)/) as string[];
      if (match) {
        names.push(match[1]);
      }
    });
    return names;
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

    const { labelFields = [], modelFields = [] } = this.referencesModel;
    const fieldMap = new Map<string, RuntimeModelField>(modelFields.map((f) => [f.name, f]));

    if (this.optionLabel) {
      const names = this.parseOptionLabelStr(this.optionLabel);

      return names.map((v) => fieldMap.get(v)!);
    }

    return labelFields.map((v) => fieldMap.get(v)!);
  }
}
