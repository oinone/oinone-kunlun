import { AuthRole, RuntimeM2OField, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget, SelectFieldWidget } from '../../../../basic';
import { RoleSelect } from '../../../../components';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToOne,
    widget: 'Role'
  })
)
export class FormM2ORoleFieldWidget extends SelectFieldWidget<AuthRole, AuthRole, RuntimeM2OField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(RoleSelect);
    return this;
  }

  protected generatorSelectItemKey(value: AuthRole): string {
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
