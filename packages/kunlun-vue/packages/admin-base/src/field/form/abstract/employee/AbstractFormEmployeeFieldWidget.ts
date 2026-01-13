import { PamirsEmployee, RuntimeRelationField } from '@oinone/kunlun-engine';
import { BooleanHelper, StringHelper } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { SelectFieldWidget } from '../../../../basic';
import { EmployeeSelect } from '../../../../components';

export abstract class AbstractFormEmployeeFieldWidget<
  Option extends PamirsEmployee = PamirsEmployee,
  Value extends PamirsEmployee | PamirsEmployee[] = PamirsEmployee | PamirsEmployee[],
  Field extends RuntimeRelationField = RuntimeRelationField
> extends SelectFieldWidget<Option, Value, Field> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(EmployeeSelect);
    return this;
  }

  @Widget.Reactive()
  protected get employeeModel(): string | undefined {
    return this.getDsl().employeeModel || this.referencesModel?.model;
  }

  @Widget.Reactive()
  protected get companyModel(): string | undefined {
    return this.getDsl().companyModel;
  }

  @Widget.Reactive()
  protected get departmentModel(): string | undefined {
    return this.getDsl().departmentModel;
  }

  @Widget.Reactive()
  protected get roleModel(): string | undefined {
    return this.getDsl().roleModel;
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
}
