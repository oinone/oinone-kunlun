import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { generatorDefaultEmployeeTreeDefinition } from '../../../../util/default-tree-definition';
import { FormM2OTreeSelectFieldWidget } from '../tree-select/FormM2OTreeSelectFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToOne,
    widget: 'Employee'
  })
)
export class FormM2OEmployeeFieldWidget extends FormM2OTreeSelectFieldWidget {
  protected generatorDefaultTreeDefinition(props) {
    return generatorDefaultEmployeeTreeDefinition();
  }
}
