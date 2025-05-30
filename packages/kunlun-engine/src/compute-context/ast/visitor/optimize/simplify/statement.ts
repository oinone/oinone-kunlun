import { ExpressionStatement, isLiteral, VisitContext } from '../../../types';
import { AdapterContext, VisitorAdapter } from '../../visit';
import { AbstractOptimizeAdapter } from '../base';

export class SimplifyStatement<C extends AdapterContext = AdapterContext>
  extends AbstractOptimizeAdapter<C>
  implements VisitorAdapter<C>
{
  public static readonly INSTANCE = new SimplifyStatement();

  public visitExpressionStatement(ctx: VisitContext<C>, node: ExpressionStatement): boolean {
    const { visitor } = ctx;
    const { expression } = node;
    visitor.next(ctx, expression);

    if (isLiteral(expression)) {
      this.toNode(node, expression);
    }
    return false;
  }
}
