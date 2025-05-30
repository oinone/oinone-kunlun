import { ConditionalExpression, isConditionalExpression, Node, NodeVisitor, VisitContext } from '../../../types';

export class ConditionExpressionExecutor implements NodeVisitor<ConditionalExpression> {
  public static readonly INSTANCE = new ConditionExpressionExecutor();

  public isSupported(node: Node): boolean {
    return isConditionalExpression(node);
  }

  public visit(ctx: VisitContext, node: ConditionalExpression) {
    const { visitor } = ctx;
    const { test, consequent, alternate } = node;
    const testValue = visitor.next(ctx, test);
    if (!!testValue) {
      return visitor.next(ctx, consequent);
    }
    return visitor.next(ctx, alternate);
  }
}
