import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../../basic';
import { ExpressionTagControl } from '@oinone/kunlun-vue-expression';
import { ExpressionBaseControlWidget } from './expressionBaseControlWidget';

/**
 * 表达式控件 文本类入口
 */
@SPI.ClassFactory(
  FormFieldWidget.Token({ viewType: ViewType.Form, ttype: ModelFieldType.String, widget: 'ExpressionTagControl' })
)
export class ExpressionTagControlWidget extends ExpressionBaseControlWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ExpressionTagControl);
    return this;
  }
}
