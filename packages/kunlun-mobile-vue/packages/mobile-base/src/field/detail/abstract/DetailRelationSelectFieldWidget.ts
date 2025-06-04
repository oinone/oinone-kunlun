import { ActiveRecords, getRelationFieldKey, RuntimeRelationField } from '@oinone/kunlun-engine';
import { isEmptyValue } from '@oinone/kunlun-meta';
import { autoFillByLabel, autoFillByLabelFields } from '../../../layout';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseSelectFieldWidget, FormComplexFieldProps } from '../../../basic';

export class DetailRelationSelectFieldWidget<
  Value extends ActiveRecords = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField,
  Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
> extends BaseSelectFieldWidget<Value, Field, Props> {
  @Widget.Reactive()
  protected get relationFieldKey() {
    // fixme @zbh 20221130 改版
    // 取pk
    // return this.referencesModel?.pks;
    return getRelationFieldKey(this.field, this.referencesModel);
  }

  protected handleTableLabel(dataEntity) {
    const realLabel = this.optionLabel || this.referencesModel?.label;
    let showValue;
    if (isEmptyValue(realLabel)) {
      showValue = autoFillByLabelFields(this.relationFieldKey, dataEntity, this.labelFields, this.separator);
    } else {
      showValue = autoFillByLabel(this.relationFieldKey, dataEntity, realLabel, this.optionLabelContextArgs);
    }
    return showValue;
  }

  @Widget.Reactive()
  protected get currentValue() {
    return this.handleTableLabel(this.value);
  }
}
