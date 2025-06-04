import { ExpressionRunParam } from '@oinone/kunlun-expression';
import { Options, parser } from '../parser';
import { Node } from '../types';
import { Executor } from './executor';
import { Optimize, OptimizeAdapter } from './optimize';
import { ToString } from './to-string';
import { Translate, TranslateAdapter, TranslateOptions } from './translate';
import { AdapterContext, Visitor, VisitorAdapter } from './visit';

export class ExpressionExecutor {
  private constructor() {
    // reject create object
  }

  public static run<R>(ctx: ExpressionRunParam, expression: string | Node, errorValue?: R): R | null | undefined {
    try {
      return Executor.run(expression, { context: ctx as unknown as Record<string, unknown> });
    } catch (e) {
      console.error(e);
      return errorValue;
    }
  }

  public static optimizeAndRun<R>(ctx: ExpressionRunParam, expression: string | Node, errorValue?: R) {
    try {
      const node = parser(expression);
      if (!node) {
        return errorValue;
      }
      Optimize.run(node, new OptimizeAdapter({ context: ctx as unknown as Record<string, unknown> }));
      return Executor.run(node, { context: ctx as unknown as Record<string, unknown> });
    } catch (e) {
      console.error(e);
      return errorValue;
    }
  }

  public static parser(expression: string | Node, options?: Partial<Options>): Node | undefined {
    return parser(expression, options);
  }

  public static toString(node: Node, visitor?: VisitorAdapter): string {
    return ToString.run(node, visitor);
  }

  /**
   * 翻译表达式
   *
   * @param expression 表达式
   * @param options 可选项 {@link TranslateOptions}
   */
  public static translate(expression: string | Node, options?: TranslateOptions): string {
    let visitor = options?.visitor;
    if (!visitor) {
      const model = options?.model;
      if (model) {
        visitor = new TranslateAdapter({ model });
      }
    }
    return (
      Translate.run(expression, {
        language: options?.language,
        visitor
      }) || ''
    );
  }

  public static visit<C extends AdapterContext = AdapterContext>(
    expression: string,
    visitorAdapter: VisitorAdapter<C>
  ): C {
    const visitor = new Visitor<C>({ visitor: visitorAdapter });
    const node = parser(expression);
    if (node) {
      visitor.visit(node);
    }
    return visitor.getContext();
  }
}
