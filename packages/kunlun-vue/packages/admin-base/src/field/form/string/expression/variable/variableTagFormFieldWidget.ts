import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../../basic';
import { VariableTagFormField } from '@oinone/kunlun-vue-expression';
import { VariableFormFieldBaseWidget } from './variableFormFieldBaseWidget';

/**
 * 适用于非表单类的变量控件
 */
@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.String,
    widget: 'VariableTagFormFieldControl'
  })
)
export class VariableTagFormFieldWidget extends VariableFormFieldBaseWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(VariableTagFormField);
    return this;
  }
}
