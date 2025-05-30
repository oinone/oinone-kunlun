import { isUnaryExpression, Node, UnaryExpression, VisitContext } from '../../../types';
import { BaseVisitor } from '../base';
import { AdapterContext } from '../types';

export class UnaryExpressionVisitor extends BaseVisitor<UnaryExpression> {
  public static readonly INSTANCE = new UnaryExpressionVisitor();

  public isSupported(node: Node): boolean {
    return isUnaryExpression(node);
  }

  public visit(ctx: VisitContext<AdapterContext>, node: UnaryExpression): boolean {
    const res = this.visitAdapter(ctx, (visitor) => visitor.visitUnaryExpression?.(ctx, node));
    if (res) {
      const { argument } = node;
      this.next(ctx, argument);
    }
    return res;
  }
}
