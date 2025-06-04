import {
  ComputableType,
  isComputableType,
  isNullableComputableType,
  NullableComputableType,
  NumberHelper
} from '@oinone/kunlun-shared';
import { BinaryExpression, isBinaryExpression, Node, NodeVisitor, VisitContext } from '../../../types';

export class BinaryExpressionExecutor implements NodeVisitor<BinaryExpression> {
  public static readonly INSTANCE = new BinaryExpressionExecutor();

  public isSupported(node: Node): boolean {
    return isBinaryExpression(node);
  }

  public visit(ctx: VisitContext, node: BinaryExpression) {
    const { visitor } = ctx;
    const { operator, left, right } = node;
    const leftValue = visitor.next(ctx, left);
    const rightValue = visitor.next(ctx, right);
    if (operator === '+') {
      if (this.isAddable(leftValue) && this.isAddable(rightValue)) {
        return this.operatorAdd(ctx, leftValue, rightValue);
      }
      return undefined;
    }
    if (this.isComparable(leftValue) || this.isComparable(rightValue)) {
      switch (operator) {
        case '==':
        case '===':
          return this.operatorEqual(ctx, leftValue as number, rightValue as number);
        case '!=':
        case '!==':
          return this.operatorNotEqual(ctx, leftValue as number, rightValue as number);
        case '<':
          return this.operatorLessThan(ctx, leftValue as number, rightValue as number);
        case '<=':
          return this.operatorLessEqual(ctx, leftValue as number, rightValue as number);
        case '>':
          return this.operatorGreaterThan(ctx, leftValue as number, rightValue as number);
        case '>=':
          return this.operatorGreaterEqual(ctx, leftValue as number, rightValue as number);
      }
    }
    if (!this.isComputable(leftValue) || !this.isComputable(rightValue)) {
      return undefined;
    }
    switch (operator) {
      case '-':
        return this.operatorSubtract(ctx, leftValue, rightValue);
      case '*':
        return this.operatorMultiply(ctx, leftValue, rightValue);
      case '/':
        return this.operatorDivide(ctx, leftValue, rightValue);
      case '%':
        return (leftValue as unknown as number) % (rightValue as unknown as number);
      case '**':
        return (leftValue as unknown as number) ** (rightValue as unknown as number);
      case '&':
        return (leftValue as unknown as number) & (rightValue as unknown as number);
      case '|':
        return (leftValue as unknown as number) | (rightValue as unknown as number);
      case '^':
        return (leftValue as unknown as number) ^ (rightValue as unknown as number);
      case '<<':
        return (leftValue as unknown as number) << (rightValue as unknown as number);
      case '>>':
        return (leftValue as unknown as number) >> (rightValue as unknown as number);
      case '>>>':
        return (leftValue as unknown as number) >>> (rightValue as unknown as number);
    }
  }

  /**
   * a == b
   * a === b
   * @param ctx
   * @param a
   * @param b
   * @protected
   */
  protected operatorEqual(ctx: VisitContext, a: NullableComputableType, b: NullableComputableType) {
    if (a === undefined) {
      a = null;
    }
    if (b === undefined) {
      b = null;
    }
    return a === b;
  }

  /**
   * a != b
   * a !== b
   * @param ctx
   * @param a
   * @param b
   * @protected
   */
  protected operatorNotEqual(ctx: VisitContext, a: NullableComputableType, b: NullableComputableType) {
    if (a === undefined) {
      a = null;
    }
    if (b === undefined) {
      b = null;
    }
    return a !== b;
  }

  /**
   * a < b
   * @param ctx
   * @param a
   * @param b
   * @protected
   */
  protected operatorLessThan(ctx: VisitContext, a: NullableComputableType, b: NullableComputableType) {
    return NumberHelper.lt(a, b);
  }

  /**
   * a <= b
   * @param ctx
   * @param a
   * @param b
   * @protected
   */
  protected operatorLessEqual(ctx: VisitContext, a: NullableComputableType, b: NullableComputableType) {
    return NumberHelper.le(a, b);
  }

  /**
   * a > b
   * @param ctx
   * @param a
   * @param b
   * @protected
   */
  protected operatorGreaterThan(ctx: VisitContext, a: NullableComputableType, b: NullableComputableType) {
    return NumberHelper.gt(a, b);
  }

  /**
   * a >= b
   * @param ctx
   * @param a
   * @param b
   * @protected
   */
  protected operatorGreaterEqual(ctx: VisitContext, a: NullableComputableType, b: NullableComputableType) {
    return NumberHelper.ge(a, b);
  }

  /**
   * a + b
   * @param ctx
   * @param a
   * @param b
   * @protected
   */
  protected operatorAdd(ctx: VisitContext, a: NullableComputableType, b: NullableComputableType) {
    if (a == null) {
      return b;
    }
    if (b == null) {
      return a;
    }
    if (typeof a === 'number' && typeof b === 'number') {
      return NumberHelper.add(a, b);
    }
    return (a as number) + (b as number);
  }

  /**
   * a - b
   * @param ctx
   * @param a
   * @param b
   * @protected
   */
  protected operatorSubtract(ctx: VisitContext, a: ComputableType, b: ComputableType) {
    if (a == null) {
      return -b;
    }
    if (b == null) {
      return a;
    }
    return NumberHelper.subtract(a, b);
  }

  /**
   * a * b
   * @param ctx
   * @param a
   * @param b
   * @protected
   */
  protected operatorMultiply(ctx: VisitContext, a: ComputableType, b: ComputableType) {
    return NumberHelper.multiply(a, b);
  }

  /**
   * a / b
   * @param ctx
   * @param a
   * @param b
   * @protected
   */
  protected operatorDivide(ctx: VisitContext, a: ComputableType, b: ComputableType) {
    return NumberHelper.divide(a, b);
  }

  /**
   * 可作加法的
   * @param value
   * @protected
   */
  protected isAddable(value: unknown): value is NullableComputableType {
    return isNullableComputableType(value, true);
  }

  /**
   * 可比较的
   * @param value
   * @protected
   */
  protected isComparable(value: unknown): value is number {
    return true;
  }

  /**
   * 可计算的
   * @param value
   * @protected
   */
  protected isComputable(value: unknown): value is ComputableType {
    return isComputableType(value, true);
  }
}
