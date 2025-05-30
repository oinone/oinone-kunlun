import { createDefaultExpressionItem, EXPRESSION_TTYPES, queryExpBuildInFunction } from '@kunlun/vue-expression';
import { ExpressionAbstractWidget } from '../ExpressionAbstractWidget';
import { Widget } from '@kunlun/vue-widget';
import { isNumberTtype, isStringTtype, ModelFieldType } from '@kunlun/meta';

export class ExpressionBaseControlWidget extends ExpressionAbstractWidget {
  public initialize(props) {
    this.setExpressionItemList([createDefaultExpressionItem(this.type)]);
    super.initialize(props);

    ExpressionBaseControlWidget.preCacheBuildInFunction();
    return this;
  }

  private static preCacheBuildInFunction() {
    queryExpBuildInFunction();
  }

  @Widget.Reactive()
  protected get ttypes(): ModelFieldType[] {
    if (super.ttypes.length) {
      if (super.ttypes.length === 1 && super.ttypes[0].toString() === 'ALL') {
        return EXPRESSION_TTYPES;
      }
      return super.ttypes;
    }
    if (this.leftJoinTtype) {
      if (isNumberTtype(this.leftJoinTtype)) {
        return [
          ModelFieldType.UID,
          ModelFieldType.ID,
          ModelFieldType.Integer,
          ModelFieldType.Long,
          ModelFieldType.Float,
          ModelFieldType.Currency
        ];
      }
      if (isStringTtype(this.leftJoinTtype)) {
        return [
          ModelFieldType.String,
          ModelFieldType.Text,
          ModelFieldType.HTML,
          ModelFieldType.Phone,
          ModelFieldType.Email
        ];
      }
      return [ this.leftJoinTtype ];
    }
    return EXPRESSION_TTYPES;
  }
}
