import { isLiteral, LogicalExpression, VisitContext } from '../../../../types';
import { Executor } from '../../../executor';
import { AdapterContext, VisitorAdapter } from '../../../visit';
import { AbstractOptimizeAdapter } from '../../base';

export class SimplifyLogicalExpression<C extends AdapterContext = AdapterContext>
  extends AbstractOptimizeAdapter<C>
  implements VisitorAdapter<C>
{
  public static readonly INSTANCE = new SimplifyLogicalExpression();

  public visitLogicalExpression(ctx: VisitContext<C>, node: LogicalExpression): boolean {
    const { visitor } = ctx;
    const { left, right, operator } = node;
    visitor.next(ctx, left);
    visitor.next(ctx, right);

    const leftIsLiteral = isLiteral(left);
    const rightIsLiteral = isLiteral(right);
    if (leftIsLiteral && rightIsLiteral) {
      this.toLiteralByValue(node, Executor.run(node));
    } else if (leftIsLiteral) {
      const res = this.getLiteralValue(left);
      if (!res.valid) {
        return false;
      }
      switch (operator) {
        case '||':
          if (res.value) {
            this.toNode(node, left);
          } else {
            this.toNode(node, right);
          }
          break;
        case '&&':
          if (res.value) {
            this.toNode(node, right);
          } else {
            this.toNode(node, left);
          }
          break;
      }
    } else if (rightIsLiteral) {
      switch (operator) {
        case '||':
          this.toNode(node, left);
          break;
        case '&&': {
          const res = this.getLiteralValue(right);
          if (!res.valid) {
            return false;
          }
          if (res.value) {
            this.toNode(node, left);
          } else {
            this.toNode(node, right);
          }
          break;
        }
      }
    }
    return false;
  }
}
