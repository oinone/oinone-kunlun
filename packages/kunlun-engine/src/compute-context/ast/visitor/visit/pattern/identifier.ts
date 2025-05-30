import { Identifier, isIdentifier, Node, VisitContext } from '../../../types';
import { BaseVisitor } from '../base';
import { AdapterContext } from '../types';

export class IdentifierVisitor extends BaseVisitor<Identifier> {
  public static readonly INSTANCE = new IdentifierVisitor();

  public isSupported(node: Node): boolean {
    return isIdentifier(node);
  }

  public visit(ctx: VisitContext<AdapterContext>, node: Identifier): boolean {
    return this.visitAdapter(ctx, (visitor) => visitor.visitIdentifier?.(ctx, node));
  }
}
