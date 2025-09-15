import { PamirsEmployee, RuntimeM2OField, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget, SelectFieldWidget } from '../../../../basic';
import { EmployeeSelect } from '../../../../components';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToOne,
    widget: 'Employee'
  })
)
export class FormM2OEmployeeFieldWidget extends SelectFieldWidget<PamirsEmployee, PamirsEmployee, RuntimeM2OField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(EmployeeSelect);
    return this;
  }

  protected generatorSelectItemKey(value: PamirsEmployee): string {
    return value.code || super.generatorSelectItemKey(value);
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value, viewMode, submitCache, submitType, relationUpdateType } = this;
    return SubmitRelationHandler.M2O(
      field,
      itemName,
      submitValue,
      value,
      viewMode,
      submitCache,
      submitType,
      relationUpdateType
    );
  }
}
