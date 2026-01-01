import { type PamirsDepartment, type RuntimeM2OField, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, StringHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget, SelectFieldWidget } from '../../../../basic';
import { DepartmentSelect } from '../../../../components';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToOne,
    widget: 'Department'
  })
)
export class FormM2ODepartmentFieldWidget extends SelectFieldWidget<
  PamirsDepartment,
  PamirsDepartment,
  RuntimeM2OField
> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DepartmentSelect);
    return this;
  }

  @Widget.Reactive()
  protected get departmentCodes(): string[] | undefined {
    return StringHelper.convertArray(this.getDsl().departmentCodes);
  }

  @Widget.Reactive()
  protected get userCompanyDept(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().userCompanyDept);
  }

  @Widget.Reactive()
  protected get userDept(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().userDept);
  }

  @Widget.Reactive()
  protected get userDeptAndChildren(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().userDeptAndChildren);
  }

  protected generatorSelectItemKey(value: PamirsDepartment): string {
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
