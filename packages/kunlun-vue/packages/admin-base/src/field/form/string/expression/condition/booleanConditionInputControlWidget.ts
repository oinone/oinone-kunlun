import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ConditionInputControl, ExpressionDefinitionType } from '@oinone/kunlun-vue-expression';
import { FormFieldWidget } from '../../../../../basic';
import { ConditionBaseControlWidget } from './conditionBaseControlWidget';

/**
 * 布尔条件表达式控件
 */
@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: 'BooleanConditionInputControl'
  })
)
export class BooleanConditionInputControlWidget extends ConditionBaseControlWidget {
  @Widget.Reactive()
  protected type = ExpressionDefinitionType.BOOLEAN_CONDITION;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(ConditionInputControl);
    return this;
  }
}
