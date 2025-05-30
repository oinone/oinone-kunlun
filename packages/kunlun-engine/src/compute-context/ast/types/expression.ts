import { AnyExpression, Expression, Node } from './base';

/**
 * 一元表达式
 */
export type UnaryExpression = Expression & {
  type: 'UnaryExpression';
  operator: UnaryOperator;
  prefix: boolean;
  argument: AnyExpression;
};

/**
 * 一元操作符
 */
export type UnaryOperator = '-' | '+' | '!' | '~' | 'typeof' | 'void' | 'delete' | 'throw';

/**
 * 自增表达式
 */
export type UpdateExpression = Expression & {
  type: 'UpdateExpression';
  operator: UpdateOperator;
  argument: AnyExpression;
  prefix: boolean;
};

/**
 * 自增操作符
 */
export type UpdateOperator = '++' | '--';

/**
 * 二元表达式
 */
export type BinaryExpression = Expression & {
  type: 'BinaryExpression';
  operator: BinaryOperator;
  left: AnyExpression;
  right: AnyExpression;
};

/**
 * 二元操作符
 */
export type BinaryOperator =
  | '=='
  | '!='
  | '==='
  | '!=='
  | '<'
  | '<='
  | '>'
  | '>='
  | '<<'
  | '>>'
  | '>>>'
  | '+'
  | '-'
  | '*'
  | '/'
  | '%'
  | '**'
  | '|'
  | '^'
  | '&'
  | 'in'
  | 'instanceof';

/**
 * 赋值表达式
 */
export type AssignmentExpression = Expression & {
  type: 'AssignmentExpression';
  operator: AssignmentOperator;
  left: AnyExpression;
  right: AnyExpression;
};

/**
 * 赋值运算符
 */
export type AssignmentOperator = '=' | '+=' | '-=' | '*=' | '/=' | '%=' | '<<=' | '>>=' | '>>>=' | '|=' | '^=' | '&=';

/**
 * 逻辑表达式
 */
export type LogicalExpression = Expression & {
  type: 'LogicalExpression';
  operator: LogicalOperator;
  left: AnyExpression;
  right: AnyExpression;
};

/**
 * 逻辑运算符
 */
export type LogicalOperator = '||' | '&&';

/**
 * 条件表达式
 * - {@link ConditionalExpression#test} ? {@link ConditionalExpression#consequent} : {@link ConditionalExpression#alternate}
 */
export type ConditionalExpression = Expression & {
  type: 'ConditionalExpression';
  test: AnyExpression;
  consequent: AnyExpression;
  alternate: AnyExpression;
};

/**
 * 成员表达式
 */
export type MemberExpression = Expression & {
  type: 'MemberExpression';
  object: AnyExpression;
  property: AnyExpression;
};

/**
 * 函数表达式 method(...arguments)
 */
export type CallExpression = Expression & {
  type: 'CallExpression';
  method: AnyExpression;
  arguments: ReadonlyArray<AnyExpression>;
  invoke?: Function;
};

export function isUnaryExpression(node: Node | undefined): node is UnaryExpression {
  return node?.type === 'UnaryExpression';
}

export function isBinaryExpression(node: Node | undefined): node is BinaryExpression {
  return node?.type === 'BinaryExpression';
}

export function isLogicalExpression(node: Node | undefined): node is LogicalExpression {
  return node?.type === 'LogicalExpression';
}

export function isConditionalExpression(node: Node | undefined): node is ConditionalExpression {
  return node?.type === 'ConditionalExpression';
}

export function isMemberExpression(node: Node | undefined): node is MemberExpression {
  return node?.type === 'MemberExpression';
}

export function isCallExpression(node: Node | undefined): node is CallExpression {
  return node?.type === 'CallExpression';
}
