import { isLiteral, UnaryExpression, VisitContext } from '../../../../types';
import { Executor } from '../../../executor';
import { AdapterContext, VisitorAdapter } from '../../../visit';
import { AbstractOptimizeAdapter } from '../../base';

export class SimplifyUnaryExpression<C extends AdapterContext = AdapterContext>
  extends AbstractOptimizeAdapter<C>
  implements VisitorAdapter<C>
{
  public static readonly INSTANCE = new SimplifyUnaryExpression();

  public visitUnaryExpression(ctx: VisitContext<C>, node: UnaryExpression): boolean {
    const { visitor } = ctx;
    const { argument } = node;
    visitor.next(ctx, argument);

    if (isLiteral(argument)) {
      this.toLiteralByValue(node, Executor.run(node));
    }

    return false;
  }
}
