import { ActiveRecord, RuntimeM2OField } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseSelectFieldWidget, FormFieldWidget } from '../../../../basic';
import { EmployeeSelect } from '../../../../components';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToOne,
    widget: 'Employee'
  })
)
export class FormM2OEmployeeFieldWidget extends BaseSelectFieldWidget<ActiveRecord, RuntimeM2OField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(EmployeeSelect);
    return this;
  }
}
