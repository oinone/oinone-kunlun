import { BinaryExpression, isBinaryExpression, Node, VisitContext } from '../../../types';
import { BaseVisitor } from '../base';
import { AdapterContext } from '../types';

export class BinaryExpressionVisitor extends BaseVisitor<BinaryExpression> {
  public static readonly INSTANCE = new BinaryExpressionVisitor();

  public isSupported(node: Node): boolean {
    return isBinaryExpression(node);
  }

  public visit(ctx: VisitContext<AdapterContext>, node: BinaryExpression): boolean {
    const res = this.visitAdapter(ctx, (visitor) => visitor.visitBinaryExpression?.(ctx, node));
    if (res) {
      const { left, right } = node;
      this.next(ctx, left);
      this.next(ctx, right);
    }
    return res;
  }
}
