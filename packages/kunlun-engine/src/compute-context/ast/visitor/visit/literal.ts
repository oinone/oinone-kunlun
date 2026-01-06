import { isLiteral, type Literal, type Node, type TemplateLiteral, type VisitContext } from '../../types';
import { BaseVisitor } from './base';
import type { AdapterContext } from './types';

export class LiteralVisitor extends BaseVisitor<Literal> {
  public static readonly INSTANCE = new LiteralVisitor();

  public isSupported(node: Node): boolean {
    return isLiteral(node);
  }

  public visit(ctx: VisitContext<AdapterContext>, node: Literal): boolean {
    const res = this.visitAdapter(ctx, (visitor) => visitor.visitLiteral?.(ctx, node));
    if (res) {
      if (node.type === 'TemplateLiteral') {
        this.visitTemplate(ctx, node as TemplateLiteral);
      }
    }
    return res;
  }

  protected visitTemplate(ctx: VisitContext<AdapterContext>, node: TemplateLiteral) {
    node.expressions.forEach((v) => {
      this.next(ctx, v);
    });
  }
}
