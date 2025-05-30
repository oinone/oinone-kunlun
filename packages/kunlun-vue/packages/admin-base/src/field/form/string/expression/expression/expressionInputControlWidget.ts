import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../../basic';
import { ExpressionInputControl } from '@kunlun/vue-expression';
import { ExpressionBaseControlWidget } from './expressionBaseControlWidget';

/**
 * 表达式控件 表达类入口
 */
@SPI.ClassFactory(
  FormFieldWidget.Token({ viewType: ViewType.Form, ttype: ModelFieldType.String, widget: 'ExpressionInputControl' })
)
export class ExpressionInputControlWidget extends ExpressionBaseControlWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ExpressionInputControl);
    return this;
  }
}
