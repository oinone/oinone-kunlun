import { ComputableType, isNullableComputableType } from '@oinone/kunlun-shared';
import { isUnaryExpression, Node, NodeVisitor, UnaryExpression, VisitContext } from '../../../types';

export class UnaryExpressionExecutor implements NodeVisitor<UnaryExpression> {
  public static readonly INSTANCE = new UnaryExpressionExecutor();

  public isSupported(node: Node): boolean {
    return isUnaryExpression(node);
  }

  public visit(ctx: VisitContext, node: UnaryExpression) {
    const { visitor } = ctx;
    const { operator, argument } = node;
    const value = visitor.next(ctx, argument);
    if (!this.isComputable(value)) {
      return undefined;
    }
    switch (operator) {
      case '-':
        return -value;
      case '+':
        return +(value as number);
      case '!':
        return !value;
      case '~':
        return ~value;
    }
  }

  /**
   * 可计算的
   * @param value
   * @protected
   */
  protected isComputable(value: unknown): value is ComputableType {
    return isNullableComputableType(value, true);
  }
}
