import { IVisitor, Node, NodeVisitor, VisitContext } from '../../types';
import {
  BinaryExpressionVisitor,
  CallExpressionVisitor,
  ConditionExpressionVisitor,
  LogicalExpressionVisitor,
  MemberExpressionVisitor,
  UnaryExpressionVisitor
} from './expression';
import { LiteralVisitor } from './literal';
import { ArrayVisitor, IdentifierVisitor } from './pattern';
import { StatementVisitor } from './statement';
import { AdapterContext, VisitorAdapter } from './types';

export interface VisitorOptions {
  optimizes?: NodeVisitor[];
  visitor?: VisitorAdapter;
  globalContext?: Record<string, unknown>;
}

export class Visitor<C extends AdapterContext = AdapterContext> implements IVisitor<C, boolean> {
  private readonly optimizes: NodeVisitor[];

  private readonly context: C;

  private readonly globalContext: Record<string, unknown>;

  private static defaultOptimizes: NodeVisitor[] = [
    LiteralVisitor.INSTANCE,
    StatementVisitor.INSTANCE,

    IdentifierVisitor.INSTANCE,
    ArrayVisitor.INSTANCE,

    CallExpressionVisitor.INSTANCE,

    BinaryExpressionVisitor.INSTANCE,
    UnaryExpressionVisitor.INSTANCE,
    ConditionExpressionVisitor.INSTANCE,
    LogicalExpressionVisitor.INSTANCE,
    MemberExpressionVisitor.INSTANCE
  ];

  public constructor(options?: VisitorOptions) {
    this.optimizes = options?.optimizes || Visitor.defaultOptimizes;
    this.context = {
      visitor: options?.visitor
    } as C;
    this.globalContext = options?.globalContext || {};
  }

  public getContext(): C {
    return this.context;
  }

  protected init(): VisitContext<C> {
    return {
      visitor: this,
      context: this.context,
      globalContext: this.globalContext
    };
  }

  public visit(root: Node): boolean {
    const context = this.init();
    return this.next(context, root);
  }

  public next(ctx: VisitContext<C>, node: Node): boolean {
    let res = this.getVisitor(node);
    while (res) {
      const { executor, index } = res;
      const returnValue = executor.visit(ctx, node);
      if (!returnValue) {
        return true;
      }
      res = this.getVisitor(node, index + 1);
    }
    return true;
  }

  public getVisitor(node: Node, offset?: number): { executor: NodeVisitor; index: number } | undefined {
    for (let index = offset || 0; index < this.optimizes.length; index++) {
      const executor = this.optimizes[index];
      if (executor.isSupported(node)) {
        return {
          executor,
          index
        };
      }
    }
    return undefined;
  }

  public static run(node: Node, visitor: VisitorAdapter): void {
    new Visitor({ visitor }).visit(node);
  }
}

export * from './types';
