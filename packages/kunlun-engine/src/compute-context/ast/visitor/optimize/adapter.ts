import { Optional } from '@oinone/kunlun-shared';
import {
  BinaryExpression,
  ConditionalExpression,
  ExpressionStatement,
  Identifier,
  isMemberExpression,
  LogicalExpression,
  MemberExpression,
  UnaryExpression,
  VisitContext
} from '../../types';
import { Executor } from '../executor';
import { AdapterContext, VisitorAdapter } from '../visit';
import { AbstractOptimizeAdapter, BaseOptimizeAdapterOptions } from './base';
import {
  SimplifyBinaryExpression,
  SimplifyConditionalExpression,
  SimplifyLogicalExpression,
  SimplifyStatement,
  SimplifyUnaryExpression
} from './simplify';

/**
 * 优化可选项
 */
export interface OptimizeAdapterOptions extends BaseOptimizeAdapterOptions {
  /**
   * 上下文参数替换
   */
  context?: Record<string, unknown>;

  /**
   * 表达式化简
   */
  simplify?:
    | boolean
    | {
        statement?: VisitorAdapter;
        binaryExpression?: VisitorAdapter;
        unaryExpression?: VisitorAdapter;
        conditionalExpression?: VisitorAdapter;
        logicalExpression?: VisitorAdapter;
      };
}

export class OptimizeAdapter<C extends AdapterContext = AdapterContext>
  extends AbstractOptimizeAdapter<C>
  implements VisitorAdapter<C>
{
  protected context: Record<string, unknown> | undefined;

  protected simplifyStatement: VisitorAdapter | undefined;

  protected simplifyBinaryExpression: VisitorAdapter | undefined;

  protected simplifyUnaryExpression: VisitorAdapter | undefined;

  protected simplifyConditionalExpression: VisitorAdapter | undefined;

  protected simplifyLogicalExpression: VisitorAdapter | undefined;

  public constructor(options?: OptimizeAdapterOptions) {
    super(options);
    this.context = options?.context;
    let simplify = Optional.ofNullable(options?.simplify).orElse(true);
    if (simplify === false) {
      return;
    }
    if (simplify === true) {
      simplify = {};
    }
    this.simplifyStatement = simplify.statement || SimplifyStatement.INSTANCE;
    this.simplifyBinaryExpression = simplify.binaryExpression || new SimplifyBinaryExpression(options);
    this.simplifyUnaryExpression = simplify.unaryExpression || SimplifyUnaryExpression.INSTANCE;
    this.simplifyConditionalExpression = simplify.conditionalExpression || SimplifyConditionalExpression.INSTANCE;
    this.simplifyLogicalExpression = simplify.logicalExpression || SimplifyLogicalExpression.INSTANCE;
  }

  public visitIdentifier(ctx: VisitContext<C>, node: Identifier): boolean {
    if (ctx.context.parent) {
      return false;
    }
    this.visitAnyExpression(ctx, node);
    return false;
  }

  public visitMemberExpression(ctx: VisitContext<C>, node: MemberExpression): boolean {
    this.visitAnyExpression(ctx, node);
    if (isMemberExpression(node)) {
      const { context } = this;
      if (context) {
        this.toLiteralByValue(node, Executor.run(node, { context }));
        return false;
      }
    }
    return false;
  }

  public visitExpressionStatement(ctx: VisitContext<C>, node: ExpressionStatement): boolean {
    return this.simplify(this.simplifyStatement, (visitor) => visitor.visitExpressionStatement?.(ctx, node));
  }

  public visitBinaryExpression(ctx: VisitContext<C>, node: BinaryExpression): boolean {
    return this.simplify(this.simplifyBinaryExpression, (visitor) => visitor.visitBinaryExpression?.(ctx, node));
  }

  public visitUnaryExpression(ctx: VisitContext<C>, node: UnaryExpression): boolean {
    return this.simplify(this.simplifyUnaryExpression, (visitor) => visitor.visitUnaryExpression?.(ctx, node));
  }

  public visitConditionalExpression(ctx: VisitContext<C>, node: ConditionalExpression): boolean {
    return this.simplify(this.simplifyConditionalExpression, (visitor) =>
      visitor.visitConditionalExpression?.(ctx, node)
    );
  }

  public visitLogicalExpression(ctx: VisitContext<C>, node: LogicalExpression): boolean {
    return this.simplify(this.simplifyLogicalExpression, (visitor) => visitor.visitLogicalExpression?.(ctx, node));
  }

  protected simplify(
    visitor: VisitorAdapter<C> | undefined,
    fn: (visitor: VisitorAdapter<C>) => boolean | undefined
  ): boolean {
    return Optional.ofNullable(visitor)
      .map((v) => fn(v))
      .orElse(true);
  }
}
