import { Identifier, isIdentifier, Node, NodeVisitor, VisitContext } from '../../../types';
import { TokenPropertiesManager } from '../../../manager';
import { EffectManager } from '../reactive';

export class IdentifierExecutor implements NodeVisitor<Identifier> {
  public static readonly INSTANCE = new IdentifierExecutor();

  public isSupported(node: Node): boolean {
    return isIdentifier(node);
  }

  public visit(ctx: VisitContext, node: Identifier) {
    const { context, globalContext } = ctx;
    if (context == null) {
      return context;
    }
    const tokenProperties = TokenPropertiesManager.get();
    if (!globalContext.isTriggerDeps && tokenProperties.length && !tokenProperties.includes(node.value)) {
      EffectManager.triggerActiveEffectDeps();
      globalContext.isTriggerDeps = true;
    }
    const res = context[node.value];
    if (typeof res === 'function') {
      return res.bind(context);
    }
    return res;
  }
}
