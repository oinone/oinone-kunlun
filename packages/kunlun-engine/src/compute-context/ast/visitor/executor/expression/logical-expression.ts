import { isLogicalExpression, LogicalExpression, Node, NodeVisitor, VisitContext } from '../../../types';

export class LogicalExpressionExecutor implements NodeVisitor<LogicalExpression> {
  public static readonly INSTANCE = new LogicalExpressionExecutor();

  public isSupported(node: Node): boolean {
    return isLogicalExpression(node);
  }

  public visit(ctx: VisitContext, node: LogicalExpression) {
    const { visitor } = ctx;
    const { operator, left, right } = node;
    switch (operator) {
      case '||': {
        const leftValue = visitor.next(ctx, left);
        if (leftValue) {
          return leftValue;
        }
        return visitor.next(ctx, right);
      }
      case '&&': {
        if (!visitor.next(ctx, left)) {
          return false;
        }
        return visitor.next(ctx, right);
      }
    }
    return undefined;
  }
}
