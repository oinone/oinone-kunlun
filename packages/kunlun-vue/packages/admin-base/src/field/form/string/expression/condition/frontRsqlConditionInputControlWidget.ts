import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../../basic';
import { DefaultComparisonOperator } from '@oinone/kunlun-request';
import {
  autoAddQuote,
  IExpressionQuoteType,
  isNumStringTtype,
  IVariableCustomMethodContext,
  IVariableValueType
} from '@oinone/kunlun-vue-expression';
import { RsqlConditionInputControlWidget } from './rsqlConditionInputControlWidget';

const LIKE_OPERATORS = [
  DefaultComparisonOperator.LIKE,
  DefaultComparisonOperator.STARTS,
  DefaultComparisonOperator.ENDS
].map((a) => a.toString());

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail],
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: 'FrontRsqlConditionInputControl'
  })
)
export class FrontRsqlConditionInputControlWidget extends RsqlConditionInputControlWidget {
  protected isFrontend = true;

  public numberCustomMethod(numStr: string | number, ttype: ModelFieldType) {
    return isNumStringTtype(ttype) ? autoAddQuote(numStr as string, IExpressionQuoteType.SINGLE) : numStr;
  }

  // 对变量额外的自定义处理方法
  public variableCustomMethod(
    variableStr: string,
    type?: IVariableValueType,
    variableCustomMethodContext?: IVariableCustomMethodContext
  ) {
    const varStr = '${' + variableStr + '}';
    const { operator } = variableCustomMethodContext || {};
    if (LIKE_OPERATORS.includes(operator!)) {
      return varStr;
    }
    return `'` + varStr + `'`;
  }
}
