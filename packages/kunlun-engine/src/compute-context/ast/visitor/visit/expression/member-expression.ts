import { isMemberExpression, MemberExpression, Node, VisitContext } from '../../../types';
import { BaseVisitor } from '../base';
import { AdapterContext } from '../types';

export class MemberExpressionVisitor extends BaseVisitor<MemberExpression> {
  public static readonly INSTANCE = new MemberExpressionVisitor();

  public isSupported(node: Node): boolean {
    return isMemberExpression(node);
  }

  public visit(ctx: VisitContext<AdapterContext>, node: MemberExpression): boolean {
    const res = this.visitAdapter(ctx, (visitor) => visitor.visitMemberExpression?.(ctx, node));
    if (res) {
      const { object, property } = node;
      this.next(ctx, object);
      this.next(ctx, property);
    }
    return res;
  }
}
