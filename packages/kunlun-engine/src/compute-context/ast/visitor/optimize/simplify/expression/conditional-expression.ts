import { ConditionalExpression, isLiteral, VisitContext } from '../../../../types';
import { AdapterContext, VisitorAdapter } from '../../../visit';
import { AbstractOptimizeAdapter } from '../../base';

export class SimplifyConditionalExpression<C extends AdapterContext = AdapterContext>
  extends AbstractOptimizeAdapter<C>
  implements VisitorAdapter<C>
{
  public static readonly INSTANCE = new SimplifyConditionalExpression();

  public visitConditionalExpression(ctx: VisitContext<C>, node: ConditionalExpression): boolean {
    const { visitor } = ctx;
    const { test, consequent, alternate } = node;
    visitor.next(ctx, test);
    visitor.next(ctx, consequent);
    visitor.next(ctx, alternate);

    if (isLiteral(test)) {
      const res = this.getLiteralValue(test);
      if (!res.valid) {
        return false;
      }
      if (res.value) {
        this.toNode(node, consequent);
      } else {
        this.toNode(node, alternate);
      }
    }
    return false;
  }
}
