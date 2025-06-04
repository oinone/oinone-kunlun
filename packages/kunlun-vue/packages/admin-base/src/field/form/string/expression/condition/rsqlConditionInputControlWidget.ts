import { Widget } from '@oinone/kunlun-vue-widget';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../../basic';
import { ConditionInputControl, ExpressionDefinitionType } from '@oinone/kunlun-vue-expression';
import { ConditionBaseControlWidget } from './conditionBaseControlWidget';

/**
 * rsql查询条件控件
 */
@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: 'RsqlConditionInputControl'
  })
)
export class RsqlConditionInputControlWidget extends ConditionBaseControlWidget {
  @Widget.Reactive()
  protected type = ExpressionDefinitionType.RSQL_CONDITION;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(ConditionInputControl);
    return this;
  }
}
