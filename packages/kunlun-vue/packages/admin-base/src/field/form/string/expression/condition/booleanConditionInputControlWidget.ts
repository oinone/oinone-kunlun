import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { ConditionInputControl, ExpressionDefinitionType } from '@kunlun/vue-expression';
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
