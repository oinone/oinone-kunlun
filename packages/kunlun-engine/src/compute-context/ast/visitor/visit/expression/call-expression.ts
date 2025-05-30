import { CallExpression, isCallExpression, Node, VisitContext } from '../../../types';
import { BaseVisitor } from '../base';
import { AdapterContext } from '../types';

export class CallExpressionVisitor extends BaseVisitor<CallExpression> {
  public static readonly INSTANCE = new CallExpressionVisitor();

  public isSupported(node: Node): boolean {
    return isCallExpression(node);
  }

  public visit(ctx: VisitContext<AdapterContext>, node: CallExpression): boolean {
    const res = this.visitAdapter(ctx, (visitor) => visitor.visitCallExpression?.(ctx, node));
    if (res) {
      const { method, arguments: methodArguments } = node;
      this.next(ctx, method);
      methodArguments.forEach((argument) => {
        this.next(ctx, argument);
      });
    }
    return res;
  }
}
