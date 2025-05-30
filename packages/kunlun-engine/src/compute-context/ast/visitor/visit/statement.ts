import { isExpressionStatement, isStatement, Node, Statement, VisitContext } from '../../types';
import { BaseVisitor } from './base';
import { AdapterContext } from './types';

export class StatementVisitor extends BaseVisitor<Statement> {
  public static readonly INSTANCE = new StatementVisitor();

  public isSupported(node: Node): boolean {
    return isStatement(node);
  }

  public visit(ctx: VisitContext<AdapterContext>, node: Statement): boolean {
    let res = true;
    if (isExpressionStatement(node)) {
      res = this.visitAdapter(ctx, (visitor) => visitor.visitExpressionStatement?.(ctx, node));
      if (res) {
        const { expression } = node;
        this.next(ctx, expression);
      }
    }
    return res;
  }
}
