import { getBinopByKey } from '../../../../tokens';
import {
  AnyExpression,
  BinaryExpression,
  BinaryOperator,
  createExpression,
  createLiteral,
  isBinaryExpression,
  isLiteral,
  isNumberLiteral,
  isUnaryExpression,
  Literal,
  Node,
  NullLiteral,
  NumberLiteral,
  UnaryExpression,
  VisitContext
} from '../../../../types';
import { Executor } from '../../../executor';
import { AdapterContext, VisitorAdapter } from '../../../visit';
import { AbstractOptimizeAdapter } from '../../base';

export interface BinaryOperatorWithBinop {
  operator: BinaryOperator;
  binop: number;
}

export interface CombiningResult extends BinaryOperatorWithBinop {
  node: NumberLiteral;
}

export class SimplifyBinaryExpression<C extends AdapterContext = AdapterContext>
  extends AbstractOptimizeAdapter<C>
  implements VisitorAdapter<C>
{
  protected combiningStack: CombiningResult[] = [];

  public visitBinaryExpression(ctx: VisitContext<C>, node: BinaryExpression): boolean {
    this.combiningStack = [];
    return this.visitBinaryExpression0(ctx, node);
  }

  protected visitBinaryExpression0(ctx: VisitContext<C>, node: BinaryExpression): boolean {
    const { visitor } = ctx;
    const { left, right, operator } = node;

    const binop = getBinopByKey(operator);
    if (binop == null) {
      return true;
    }

    if (isBinaryExpression(left)) {
      this.computeBinaryExpressionByBinop(ctx, node, left, right, { operator, binop, left: false });
      if (!isBinaryExpression(node)) {
        return false;
      }
    } else {
      visitor.next(ctx, left);
    }

    if (isBinaryExpression(right)) {
      this.computeBinaryExpressionByBinop(ctx, node, right, left, { operator, binop, left: true });
      if (!isBinaryExpression(node)) {
        return false;
      }
    } else {
      visitor.next(ctx, right);
    }

    this.simplifyBinaryExpression(node);

    return false;
  }

  protected computeBinaryExpressionByBinop(
    ctx: VisitContext<C>,
    originNode: BinaryExpression,
    targetNode: BinaryExpression,
    maybeLiteralNode: AnyExpression,
    lasted: BinaryOperatorWithBinop & { left: boolean }
  ): void {
    const { left, right, operator } = targetNode;

    const binop = getBinopByKey(operator);
    if (binop == null) {
      this.visitBinaryExpression0(ctx, targetNode);
      return;
    }

    const res = this.getLiteralValue(maybeLiteralNode);
    if (!res.valid) {
      this.visitBinaryExpression0(ctx, targetNode);
      return;
    }
    const literalNode = maybeLiteralNode as Literal;
    this.combiningSimilarItems(literalNode, lasted);

    const leftIsLiteral = isLiteral(left);
    const rightIsLiteral = isLiteral(right);

    if (leftIsLiteral && rightIsLiteral) {
      this.toLiteralByValue(targetNode, Executor.run(targetNode));
      return;
    }

    let computed = false;

    const { operator: lastedOperator, binop: lastedBinop, left: lastedLeft } = lasted;

    if (leftIsLiteral) {
      const computedOperator = this.computeOperator(
        { operator: lastedOperator, binop: lastedBinop },
        { operator, binop }
      );
      if (computedOperator) {
        const { compute: computeOperator, change: changeOperator } = computedOperator;
        this.toLiteralByValue(
          literalNode,
          Executor.run(
            createExpression<BinaryExpression>('BinaryExpression', {
              operator: computeOperator,
              left: literalNode,
              right: left
            })
          )
        );
        if (lastedLeft) {
          originNode.right = right;
        } else {
          originNode.left = right;
        }
        if (changeOperator) {
          originNode.operator = changeOperator;
        }
        computed = true;
      }
    } else if (rightIsLiteral) {
      const computedOperator = this.computeOperator(
        { operator: lastedOperator, binop: lastedBinop },
        { operator, binop }
      );
      if (computedOperator) {
        const { compute: computeOperator, change: changeOperator } = computedOperator;
        this.toLiteralByValue(
          literalNode,
          Executor.run(
            createExpression<BinaryExpression>('BinaryExpression', {
              operator: computeOperator,
              left: literalNode,
              right
            })
          )
        );
        if (lastedLeft) {
          originNode.right = left;
        } else {
          originNode.left = left;
        }
        if (changeOperator) {
          originNode.operator = changeOperator;
        }
        computed = true;
      }
    }

    if (computed) {
      this.visitBinaryExpression0(ctx, originNode);
    } else {
      this.visitBinaryExpression0(ctx, targetNode);
    }
  }

  protected computeOperator(
    lasted: BinaryOperatorWithBinop,
    current: BinaryOperatorWithBinop
  ):
    | {
        compute: BinaryOperator;
        change?: BinaryOperator;
      }
    | undefined {
    const { operator: lastedOperator, binop: lastedBinop } = lasted;
    const { operator, binop } = current;
    switch (operator) {
      case '+':
      case '*': {
        if (binop > lastedBinop) {
          return undefined;
        }
        return { compute: lastedOperator };
      }
      case '-':
        if (lastedOperator === '+') {
          return { compute: '-' };
        }
        if (lastedOperator === '-') {
          return { compute: '+' };
        }
        break;
      case '/':
        if (lastedOperator === '/') {
          return { compute: '*' };
        }
        if (lastedOperator === '*') {
          return { compute: '/' };
        }
        if (lastedOperator === '<<') {
          return { compute: '>>', change: operator };
        }
        if (lastedOperator === '>>') {
          return { compute: '<<', change: operator };
        }
        break;
    }
  }

  /**
   * 二元表达式化简
   * @param node
   * @protected
   */
  protected simplifyBinaryExpression(node: BinaryExpression): boolean {
    const { left, right, operator } = node;

    const leftIsLiteral = isLiteral(left);
    const rightIsLiteral = isLiteral(right);

    if (leftIsLiteral && rightIsLiteral) {
      this.toLiteralByValue(node, Executor.run(node));
      return false;
    }

    if (!leftIsLiteral && !rightIsLiteral) {
      return false;
    }

    let literalValue: unknown;
    let isValidLiteralValue = false;
    if (leftIsLiteral) {
      const res = this.getLiteralValue(left);
      if (res.valid) {
        literalValue = res.value;
        isValidLiteralValue = true;
      }
    } else {
      const res = this.getLiteralValue(right);
      if (res.valid) {
        literalValue = res.value;
        isValidLiteralValue = true;
      }
    }

    if (!isValidLiteralValue) {
      return false;
    }

    switch (operator) {
      case '+':
        return this.simplifyExpressionByAdd(node, left, right, leftIsLiteral, rightIsLiteral, literalValue);
      case '-':
        return this.simplifyExpressionBySubtract(node, left, right, leftIsLiteral, rightIsLiteral, literalValue);
      case '*':
        return this.simplifyExpressionByMultiply(node, left, right, leftIsLiteral, rightIsLiteral, literalValue);
      case '/':
        return this.simplifyExpressionByDivide(node, left, right, leftIsLiteral, rightIsLiteral, literalValue);
    }
    return false;
  }

  protected simplifyExpressionByAdd(
    node: BinaryExpression,
    left: AnyExpression,
    right: AnyExpression,
    leftIsLiteral: boolean,
    rightIsLiteral: boolean,
    literalValue: unknown
  ): boolean {
    if (literalValue == null || literalValue === 0) {
      if (leftIsLiteral) {
        this.toNode(node, right);
      } else {
        this.toNode(node, left);
      }
      return true;
    }
    return false;
  }

  protected simplifyExpressionBySubtract(
    node: BinaryExpression,
    left: AnyExpression,
    right: AnyExpression,
    leftIsLiteral: boolean,
    rightIsLiteral: boolean,
    literalValue: unknown
  ): boolean {
    if (rightIsLiteral) {
      if (literalValue == null || literalValue === 0) {
        this.toNode(node, left);
        return true;
      }
      if (typeof literalValue === 'number' && literalValue < 0) {
        node.operator = '+';
        this.toLiteralByValue(right, -literalValue);
        return true;
      }
    }
    return false;
  }

  protected simplifyExpressionByMultiply(
    node: BinaryExpression,
    left: AnyExpression,
    right: AnyExpression,
    leftIsLiteral: boolean,
    rightIsLiteral: boolean,
    literalValue: unknown
  ): boolean {
    if (literalValue == null || literalValue === 0) {
      this.toLiteralByValue(node, 0);
      return true;
    }
    if (literalValue === 1) {
      if (leftIsLiteral) {
        this.toNode(node, right);
      } else {
        this.toNode(node, left);
      }
      return true;
    }
    if (this.invertUnaryExpression(node, left, right, leftIsLiteral, rightIsLiteral, literalValue)) {
      return true;
    }
    return false;
  }

  protected simplifyExpressionByDivide(
    node: BinaryExpression,
    left: AnyExpression,
    right: AnyExpression,
    leftIsLiteral: boolean,
    rightIsLiteral: boolean,
    literalValue: unknown
  ): boolean {
    if (leftIsLiteral) {
      if (literalValue == null || literalValue === 0) {
        this.toLiteralByValue(node, 0);
        return true;
      }
    } else {
      if (literalValue == null || literalValue === 0) {
        this.toLiteralByValue(node, Infinity);
        return true;
      }
      if (literalValue === 1) {
        this.toNode(node, left);
        return true;
      }
      if (this.invertUnaryExpression(node, left, right, leftIsLiteral, rightIsLiteral, literalValue)) {
        return true;
      }
    }
    return false;
  }

  protected invertUnaryExpression(
    node: BinaryExpression,
    left: AnyExpression,
    right: AnyExpression,
    leftIsLiteral: boolean,
    rightIsLiteral: boolean,
    literalValue: unknown
  ) {
    if (literalValue === -1) {
      if (leftIsLiteral) {
        this.convertInvertUnaryExpression(node, right);
      } else {
        this.convertInvertUnaryExpression(node, left);
      }
      return true;
    }
    if (typeof literalValue === 'number' && literalValue < 0) {
      if (leftIsLiteral) {
        this.convertInvertUnaryExpression(right);
        this.toLiteralByValue(left, -literalValue);
      } else {
        this.convertInvertUnaryExpression(left);
        this.toLiteralByValue(right, -literalValue);
      }
      return true;
    }
    return false;
  }

  protected convertInvertUnaryExpression(target: Node, argument?: Node): AnyExpression {
    if (!argument) {
      argument = target;
    }
    if (isUnaryExpression(argument) && argument.operator === '-') {
      return this.toNode(target, argument.argument);
    }
    return this.toNode(
      target,
      createExpression<UnaryExpression>('UnaryExpression', {
        operator: '-',
        prefix: true,
        argument: target === argument ? { ...argument } : argument
      })
    );
  }

  protected combiningSimilarItems(literalNode: Literal, lasted: BinaryOperatorWithBinop & { left: boolean }) {
    if (['+', '-'].includes(lasted.operator)) {
      const lastedIndex = this.combiningStack.length - 1;
      let lastedCombiningResult = this.combiningStack[lastedIndex];
      if (lastedCombiningResult) {
        if (lastedCombiningResult.node !== literalNode) {
          this.toLiteralByValue(
            literalNode,
            Executor.run(
              createExpression('BinaryExpression', {
                operator: lastedCombiningResult.operator === lasted.operator ? '+' : '-',
                left: lastedCombiningResult.node,
                right: literalNode
              })
            )
          );
          this.toNode(lastedCombiningResult.node, createLiteral<NullLiteral>('NullLiteral', {}));
          if (isNumberLiteral(literalNode)) {
            let nextOperator: BinaryOperator;
            if (literalNode.value >= 0) {
              nextOperator = '+';
            } else {
              nextOperator = '-';
            }
            lastedCombiningResult = {
              node: literalNode,
              operator: nextOperator,
              binop: lasted.binop
            };
            this.combiningStack[lastedIndex] = lastedCombiningResult;
          } else {
            this.combiningStack.pop();
          }
        }
      } else if (isNumberLiteral(literalNode)) {
        let nextOperator: BinaryOperator;
        if (literalNode.value >= 0) {
          nextOperator = '+';
        } else {
          nextOperator = '-';
        }
        lastedCombiningResult = {
          node: literalNode,
          operator: nextOperator,
          binop: lasted.binop
        };
        this.combiningStack.push(lastedCombiningResult);
      }
    }
  }
}
