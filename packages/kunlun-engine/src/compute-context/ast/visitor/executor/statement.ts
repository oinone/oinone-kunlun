import { ExpressionStatement, isStatement, Node, NodeVisitor, Statement, VisitContext } from '../../types';

export class StatementExecutor implements NodeVisitor<Statement> {
  public static readonly INSTANCE = new StatementExecutor();

  public isSupported(node: Node): boolean {
    return isStatement(node);
  }

  public visit(ctx: VisitContext, node: Statement) {
    const { visitor } = ctx;
    const { type } = node;
    switch (type) {
      case 'ExpressionStatement':
        return visitor.next(ctx, (node as ExpressionStatement).expression);
    }
  }
}
