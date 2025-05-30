import { ArrayPattern, Node, VisitContext } from '../../../types';
import { BaseVisitor } from '../base';
import { AdapterContext } from '../types';

export class ArrayVisitor extends BaseVisitor<ArrayPattern> {
  public static readonly INSTANCE = new ArrayVisitor();

  public isSupported(node: Node): boolean {
    return node.type === 'ArrayPattern';
  }

  public visit(ctx: VisitContext<AdapterContext>, node: ArrayPattern): boolean {
    const res = this.visitAdapter(ctx, (visitor) => visitor.visitArrayPattern?.(ctx, node));
    if (res) {
      const { elements } = node;
      elements.forEach((element) => {
        this.next(ctx, element);
      });
    }
    return res;
  }
}
