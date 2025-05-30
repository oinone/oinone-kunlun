import { CallExpression, isCallExpression, Node, NodeVisitor, VisitContext } from '../../../types';

export class CallExpressionExecutor implements NodeVisitor<CallExpression> {
  public static readonly INSTANCE = new CallExpressionExecutor();

  public isSupported(node: Node): boolean {
    return isCallExpression(node);
  }

  public visit(ctx: VisitContext, node: CallExpression) {
    const { visitor } = ctx;
    const { method, arguments: methodArguments, invoke } = node;
    let functionInstance: unknown;
    if (invoke) {
      functionInstance = invoke;
    } else {
      functionInstance = visitor.next(ctx, method);
    }
    if (typeof functionInstance === 'function') {
      const args: unknown[] = [];
      for (const argument of methodArguments) {
        args.push(visitor.next(ctx, argument));
      }
      return functionInstance(...args);
    }
    console.error('Invalid function.', node);
    throw new Error('Invalid function.');
  }
}
