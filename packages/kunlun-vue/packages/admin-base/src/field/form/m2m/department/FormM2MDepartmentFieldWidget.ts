import { ActiveRecord, RuntimeM2MField } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseSelectFieldWidget, FormFieldWidget } from '../../../../basic';
import { DepartmentSelect } from '../../../../components';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToMany,
    widget: 'Department'
  })
)
export class FormM2MDepartmentFieldWidget extends BaseSelectFieldWidget<ActiveRecord[], RuntimeM2MField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DepartmentSelect);
    return this;
  }
}
