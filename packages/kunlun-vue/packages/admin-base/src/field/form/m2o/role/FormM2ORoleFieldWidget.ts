import { ActiveRecord, RuntimeM2OField } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseSelectFieldWidget, FormFieldWidget } from '../../../../basic';
import { RoleSelect } from '../../../../components';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToOne,
    widget: 'Role'
  })
)
export class FormM2ORoleFieldWidget extends BaseSelectFieldWidget<ActiveRecord, RuntimeM2OField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(RoleSelect);
    return this;
  }
}
