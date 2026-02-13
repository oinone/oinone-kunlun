import { PamirsDepartment, RuntimeRelationField } from '@oinone/kunlun-engine';
import { BooleanHelper, StringHelper } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { SelectFieldWidget } from '../../../../basic';
import { DepartmentSelect } from '../../../../components';

export abstract class AbstractFormDepartmentFieldWidget<
  Option extends PamirsDepartment = PamirsDepartment,
  Value extends PamirsDepartment | PamirsDepartment[] = PamirsDepartment | PamirsDepartment[],
  Field extends RuntimeRelationField = RuntimeRelationField
> extends SelectFieldWidget<Option, Value, Field> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DepartmentSelect);
    return this;
  }

  @Widget.Reactive()
  protected get departmentModel() {
    return this.getDsl().departmentModel || this.referencesModel?.model;
  }

  @Widget.Reactive()
  protected get companyModel() {
    return this.getDsl().companyModel;
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
}
