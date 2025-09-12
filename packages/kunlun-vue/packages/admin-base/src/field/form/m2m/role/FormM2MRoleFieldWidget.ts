import { ActiveRecord, RuntimeM2MField } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseSelectFieldWidget, FormFieldWidget } from '../../../../basic';
import { RoleSelect } from '../../../../components';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToMany,
    widget: 'Role'
  })
)
export class FormM2MRoleFieldWidget extends BaseSelectFieldWidget<ActiveRecord[], RuntimeM2MField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(RoleSelect);
    return this;
  }
}
