import { AuthRole, RuntimeRelationField } from '@oinone/kunlun-engine';
import { BooleanHelper, StringHelper } from '@oinone/kunlun-shared';
import { ValidateTrigger, WidgetTrigger } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { SelectFieldWidget } from '../../../../basic';
import { RoleSelect } from '../../../../components';

export abstract class AbstractFormRoleFieldWidget<
  Option extends AuthRole = AuthRole,
  Value extends AuthRole | AuthRole[] = AuthRole | AuthRole[],
  Field extends RuntimeRelationField = RuntimeRelationField
> extends SelectFieldWidget<Option, Value, Field> {
  public defaultValidateTrigger: ValidateTrigger[] = [ValidateTrigger.change];

  protected defaultConstructDataTrigger() {
    return [WidgetTrigger.change];
  }

  protected defaultClearFieldsTrigger() {
    return [WidgetTrigger.change];
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(RoleSelect);
    return this;
  }

  @Widget.Reactive()
  protected get roleModel(): string | undefined {
    return this.getDsl().roleModel || this.referencesModel?.model;
  }

  @Widget.Reactive()
  protected get roleCodes(): string[] | undefined {
    return StringHelper.convertArray(this.getDsl().roleCodes);
  }

  @Widget.Reactive()
  protected get userRole(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().userRole);
  }

  protected generatorSelectItemKey(value: AuthRole): string {
    return value.code || super.generatorSelectItemKey(value);
  }
}
