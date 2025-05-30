import {
  isIdentifier,
  isMemberExpression,
  MemberExpression,
  Node,
  NodeVisitor,
  TokenContext,
  VisitContext
} from '../../../types';

export class MemberExpressionExecutor implements NodeVisitor<MemberExpression> {
  public static readonly INSTANCE = new MemberExpressionExecutor();

  public isSupported(node: Node): boolean {
    return isMemberExpression(node);
  }

  public visit(ctx: VisitContext, node: MemberExpression) {
    const { visitor, globalContext } = ctx;
    const { object, property } = node;
    const objectValue = visitor.next(ctx, object);
    if (isIdentifier(property)) {
      const subcontext: VisitContext = {
        visitor,
        context: objectValue as TokenContext,
        globalContext
      };
      return visitor.next(subcontext, property);
    }
    const propertyValue = visitor.next(ctx, property);
    return (objectValue as Record<string, unknown>)?.[propertyValue as string];
  }
}
