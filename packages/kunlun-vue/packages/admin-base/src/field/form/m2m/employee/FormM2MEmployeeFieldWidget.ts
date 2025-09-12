import { ActiveRecord, RuntimeM2MField } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseSelectFieldWidget, FormFieldWidget } from '../../../../basic';
import { EmployeeSelect } from '../../../../components';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToMany,
    widget: 'Employee'
  })
)
export class FormM2MEmployeeFieldWidget extends BaseSelectFieldWidget<ActiveRecord[], RuntimeM2MField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(EmployeeSelect);
    return this;
  }
}
