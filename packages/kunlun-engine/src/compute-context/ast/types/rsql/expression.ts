import { AnyExpression, Expression } from '../base';

/**
 * 逻辑表达式
 */
export type RSQLLogicalExpression = Expression & {
  type: 'RSQLLogicalExpression';
  operator: RSQLLogicalOperator;
  left: AnyExpression;
  right: AnyExpression;
};

/**
 * 逻辑运算符
 */
export type RSQLLogicalOperator = 'and' | 'or';
