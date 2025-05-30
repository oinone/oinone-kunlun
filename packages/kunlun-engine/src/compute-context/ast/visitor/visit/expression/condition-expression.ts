import { ConditionalExpression, isConditionalExpression, Node, VisitContext } from '../../../types';
import { BaseVisitor } from '../base';
import { AdapterContext } from '../types';

export class ConditionExpressionVisitor extends BaseVisitor<ConditionalExpression> {
  public static readonly INSTANCE = new ConditionExpressionVisitor();

  public isSupported(node: Node): boolean {
    return isConditionalExpression(node);
  }

  public visit(ctx: VisitContext<AdapterContext>, node: ConditionalExpression): boolean {
    const res = this.visitAdapter(ctx, (visitor) => visitor.visitConditionalExpression?.(ctx, node));
    if (res) {
      const { test, consequent, alternate } = node;
      this.next(ctx, test);
      this.next(ctx, consequent);
      this.next(ctx, alternate);
    }
    return res;
  }
}
