import { ArrayPattern, Node, NodeVisitor, VisitContext } from '../../../types';

export class ArrayExecutor implements NodeVisitor<ArrayPattern> {
  public static readonly INSTANCE = new ArrayExecutor();

  public isSupported(node: Node): boolean {
    return node.type === 'ArrayPattern';
  }

  public visit(ctx: VisitContext, node: ArrayPattern) {
    const { visitor } = ctx;
    const { elements } = node;
    const arrays: unknown[] = [];
    for (const element of elements) {
      arrays.push(visitor.next(ctx, element));
    }
    return arrays;
  }
}
