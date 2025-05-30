import { isLogicalExpression, LogicalExpression, Node, VisitContext } from '../../../types';
import { BaseVisitor } from '../base';
import { AdapterContext } from '../types';

export class LogicalExpressionVisitor extends BaseVisitor<LogicalExpression> {
  public static readonly INSTANCE = new LogicalExpressionVisitor();

  public isSupported(node: Node): boolean {
    return isLogicalExpression(node);
  }

  public visit(ctx: VisitContext<AdapterContext>, node: LogicalExpression): boolean {
    const res = this.visitAdapter(ctx, (visitor) => visitor.visitLogicalExpression?.(ctx, node));
    if (res) {
      const { left, right } = node;
      this.next(ctx, left);
      this.next(ctx, right);
    }
    return res;
  }
}
