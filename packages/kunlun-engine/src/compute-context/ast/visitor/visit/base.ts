import { Optional } from '@kunlun/shared';
import { Node, NodeVisitor, VisitContext } from '../../types';
import { AdapterContext, VisitorAdapter } from './types';

export abstract class BaseVisitor<N extends Node = Node, C extends AdapterContext = AdapterContext>
  implements NodeVisitor<N, C, boolean>
{
  public abstract isSupported(node: N): boolean;

  public abstract visit(ctx: VisitContext<C>, node: N): boolean;

  protected visitAdapter(ctx: VisitContext<C>, visit: (visitor: VisitorAdapter) => boolean | undefined): boolean {
    return Optional.ofNullable(ctx.context.visitor)
      .map((v) => visit(v))
      .orElse(true);
  }

  protected next(ctx: VisitContext<C>, node: Node): boolean {
    const { visitor, context } = ctx;
    const { parent } = context;
    context.parent = node;
    const res = visitor.next(ctx, node);
    context.parent = parent;
    return !!res;
  }
}
