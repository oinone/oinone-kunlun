import { AnyExpression, Node, Statement } from './base';

export type BlockStatement = Statement & {
  type: 'BlockStatement';
  body: ReadonlyArray<Statement>;
};

export type ExpressionStatement = Statement & {
  type: 'ExpressionStatement';
  expression: AnyExpression;
};

export function isExpressionStatement(node: Node | undefined): node is ExpressionStatement {
  return node?.type === 'ExpressionStatement';
}
