import { FieldDslDefinition } from '@oinone/kunlun-dsl';
import { BooleanHelper, RSQLOperators } from '@oinone/kunlun-shared';
import { RuntimeSearchField } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';

export function convertSearchField(runtimeContext: RuntimeContext, dsl: FieldDslDefinition, field: RuntimeSearchField) {
  field.operator = convertOperator(dsl.operator);
  field.allowSearch = BooleanHelper.toBoolean(dsl.allowSearch);
}

/**
 * 使用后端数据字典进行映射
 * ui.designer.UiDesignerOperatorEnum
 * @param operator 操作符
 */
function convertOperator(operator: string | undefined): string | undefined {
  if (!operator) {
    return undefined;
  }
  switch (operator) {
    case 'EQUAL':
      return RSQLOperators.EQUAL.symbol;
    case 'IN':
      return RSQLOperators.IN.symbol;
    case 'LIKE':
      return RSQLOperators.LIKE.symbol;
    case 'STARTS':
      return RSQLOperators.LIKE_RIGHT.symbol;
    case 'ENDS':
      return RSQLOperators.LIKE_LEFT.symbol;
    case 'GT':
      return RSQLOperators.GREATER_THAN.symbol;
    case 'GE':
      return RSQLOperators.GREATER_THAN_OR_EQUAL.symbol;
    case 'LT':
      return RSQLOperators.LESS_THAN.symbol;
    case 'LE':
      return RSQLOperators.LESS_THAN_OR_EQUAL.symbol;
    case 'HAS':
      return RSQLOperators.HAS.symbol;
    case 'HAS_OR':
      return RSQLOperators.HAS_OR.symbol;
    case 'GE_LT':
      return `${RSQLOperators.GREATER_THAN_OR_EQUAL.symbol},${RSQLOperators.LESS_THAN.symbol}`;
    case 'GE_LE':
      return `${RSQLOperators.GREATER_THAN_OR_EQUAL.symbol},${RSQLOperators.LESS_THAN_OR_EQUAL.symbol}`;
  }
  return operator;
}
