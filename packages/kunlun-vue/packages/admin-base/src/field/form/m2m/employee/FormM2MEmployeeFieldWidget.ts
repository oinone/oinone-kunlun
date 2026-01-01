import { type PamirsEmployee, type RuntimeM2MField, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, Optional, StringHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget, SelectFieldWidget } from '../../../../basic';
import { EmployeeSelect } from '../../../../components';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToMany,
    widget: 'Employee'
  })
)
export class FormM2MEmployeeFieldWidget extends SelectFieldWidget<PamirsEmployee, PamirsEmployee[], RuntimeM2MField> {
  @Widget.Reactive()
  protected mode: SelectMode = SelectMode.multiple;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(EmployeeSelect);
    return this;
  }

  @Widget.Reactive()
  protected get employeeCodes(): string[] | undefined {
    return StringHelper.convertArray(this.getDsl().employeeCodes);
  }

  @Widget.Reactive()
  protected get departmentCodes(): string[] | undefined {
    return StringHelper.convertArray(this.getDsl().departmentCodes);
  }

  @Widget.Reactive()
  protected get roleCodes(): string[] | undefined {
    return StringHelper.convertArray(this.getDsl().roleCodes);
  }

  @Widget.Reactive()
  protected get userEmployee(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().userEmployee);
  }

  @Widget.Reactive()
  protected get userDept(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().userDept);
  }

  @Widget.Reactive()
  protected get userDeptAndChildren(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().userDeptAndChildren);
  }

  protected generatorSelectItemKey(value: PamirsEmployee): string {
    return value.code || super.generatorSelectItemKey(value);
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value, viewMode, submitCache, submitType, relationUpdateType } = this;
    return SubmitRelationHandler.M2M(
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
