import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../../basic';
import { Widget } from '@oinone/kunlun-vue-widget';
import { VariableInputFormField } from '@oinone/kunlun-vue-expression';
import { VariableFormFieldBaseWidget } from './variableFormFieldBaseWidget';

/**
 * 适用于表单类变量控件
 */
@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.String,
    widget: 'VariableInputFormFieldControl'
  })
)
export class VariableInputFormFieldWidget extends VariableFormFieldBaseWidget {
  @Widget.Reactive()
  private isVariableWidget = true;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(VariableInputFormField);
    return this;
  }
}
