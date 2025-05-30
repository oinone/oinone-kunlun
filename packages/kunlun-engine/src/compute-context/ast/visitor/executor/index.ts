import { Nullable } from '@kunlun/shared';
import { parser } from '../../parser';
import { IVisitor, Node, NodeVisitor, TokenContext, VisitContext } from '../../types';
import {
  BinaryExpressionExecutor,
  CallExpressionExecutor,
  ConditionExpressionExecutor,
  LogicalExpressionExecutor,
  MemberExpressionExecutor,
  UnaryExpressionExecutor
} from './expression';
import { LiteralExecutor } from './literal';
import { ArrayExecutor, IdentifierExecutor } from './pattern';
import { StatementExecutor } from './statement';

export interface ExecutorOptions {
  executors?: NodeVisitor[];
  context?: Record<string, unknown>;
  globalContext?: Record<string, unknown>;
}

export class Executor<C extends TokenContext = TokenContext, R = unknown> implements IVisitor<C, Nullable<R>> {
  private readonly executors: NodeVisitor[];

  private readonly context: C;

  private readonly globalContext: Record<string, unknown>;

  private static defaultExecutors: NodeVisitor[] = [
    LiteralExecutor.INSTANCE,
    StatementExecutor.INSTANCE,

    IdentifierExecutor.INSTANCE,
    ArrayExecutor.INSTANCE,

    CallExpressionExecutor.INSTANCE,

    BinaryExpressionExecutor.INSTANCE,
    UnaryExpressionExecutor.INSTANCE,
    ConditionExpressionExecutor.INSTANCE,
    LogicalExpressionExecutor.INSTANCE,
    MemberExpressionExecutor.INSTANCE
  ];

  public constructor(options?: ExecutorOptions) {
    this.executors = options?.executors || Executor.defaultExecutors;
    this.context = (options?.context || {}) as C;
    this.globalContext = options?.globalContext || {};
  }

  protected init(): VisitContext<C> {
    return {
      visitor: this,
      context: this.context,
      globalContext: this.globalContext
    };
  }

  public visit(root: Node): Nullable<R> {
    const context = this.init();
    return this.next(context, root);
  }

  public next(ctx: VisitContext<C>, node: Node): Nullable<R> {
    let res = this.getExecutor(node);
    while (res) {
      const { executor, index } = res;
      const returnValue = executor.visit(ctx, node);
      if (returnValue !== undefined) {
        return returnValue as Nullable<R>;
      }
      res = this.getExecutor(node, index + 1);
    }
    return undefined;
  }

  public getExecutor(node: Node, offset?: number): { executor: NodeVisitor; index: number } | undefined {
    for (let index = offset || 0; index < this.executors.length; index++) {
      const executor = this.executors[index];
      if (executor.isSupported(node)) {
        return {
          executor,
          index
        };
      }
    }
    return undefined;
  }

  public static run<R>(expression: string | Node, options?: ExecutorOptions): Nullable<R> {
    const node = parser(expression);
    if (!node) {
      return null;
    }
    return new Executor(options).visit(node) as Nullable<R>;
  }
}
