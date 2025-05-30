import {
  ArrayPattern,
  BinaryExpression,
  CallExpression,
  ConditionalExpression,
  ExpressionStatement,
  Identifier,
  Literal,
  LogicalExpression,
  MemberExpression,
  Node,
  TokenContext,
  UnaryExpression,
  VisitContext
} from '../../types';

export interface AdapterContext extends TokenContext {
  visitor: VisitorAdapter;
  parent?: Node;
}

export interface VisitorAdapter<C extends AdapterContext = AdapterContext> {
  visitLiteral?(ctx: VisitContext<C>, node: Literal): boolean;

  visitIdentifier?(ctx: VisitContext<C>, node: Identifier): boolean;

  visitExpressionStatement?(ctx: VisitContext<C>, node: ExpressionStatement): boolean;

  visitArrayPattern?(ctx: VisitContext<C>, node: ArrayPattern): boolean;

  visitCallExpression?(ctx: VisitContext<C>, node: CallExpression): boolean;

  visitBinaryExpression?(ctx: VisitContext<C>, node: BinaryExpression): boolean;

  visitUnaryExpression?(ctx: VisitContext<C>, node: UnaryExpression): boolean;

  visitConditionalExpression?(ctx: VisitContext<C>, node: ConditionalExpression): boolean;

  visitLogicalExpression?(ctx: VisitContext<C>, node: LogicalExpression): boolean;

  visitMemberExpression?(ctx: VisitContext<C>, node: MemberExpression): boolean;
}
