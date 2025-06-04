import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../basic';
import { generatorDefaultCompanyTreeDefinition } from '../../../../util/default-tree-definition';
import { FormM2MTreeSelectFieldWidget } from '../tree-select/FormM2MTreeSelectFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToMany,
    widget: 'Company'
  })
)
export class FormM2MCompanyFieldWidget extends FormM2MTreeSelectFieldWidget {
  protected generatorDefaultTreeDefinition(props) {
    return generatorDefaultCompanyTreeDefinition();
  }
}
