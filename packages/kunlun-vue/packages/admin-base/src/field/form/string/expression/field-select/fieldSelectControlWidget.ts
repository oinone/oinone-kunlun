import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../../basic';
import { VariableFormFieldBaseWidget } from '../variable/variableFormFieldBaseWidget';
import { FieldSelectControl } from '@kunlun/vue-expression';

/**
 * 先选模型再选字段的选择控件
 */
@SPI.ClassFactory(
  FormFieldWidget.Token({
    widget: 'FieldSelectControl',
    viewType: ViewType.Form,
    ttype: ModelFieldType.String
  })
)
export class FieldSelectControlWidget extends VariableFormFieldBaseWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(FieldSelectControl);
    return this;
  }
}
