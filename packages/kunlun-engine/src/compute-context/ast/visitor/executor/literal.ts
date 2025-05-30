import { Optional } from '@kunlun/shared';
import {
  BooleanLiteral,
  isLiteral,
  Literal,
  Node,
  NodeVisitor,
  NumberLiteral,
  RegExpLiteral,
  StringLiteral,
  TemplateLiteral,
  VisitContext
} from '../../types';

export class LiteralExecutor implements NodeVisitor<Literal> {
  public static readonly INSTANCE = new LiteralExecutor();

  public isSupported(node: Node): boolean {
    return isLiteral(node);
  }

  public visit(ctx: VisitContext, node: Literal) {
    const { type } = node;
    switch (type) {
      case 'UndefinedLiteral':
        return undefined;
      case 'NullLiteral':
        return null;
      case 'StringLiteral':
        return (node as StringLiteral).value;
      case 'TemplateLiteral':
        return this.visitTemplate(ctx, node as TemplateLiteral);
      case 'NumberLiteral':
        return (node as NumberLiteral).value;
      case 'BooleanLiteral':
        return (node as BooleanLiteral).value;
      case 'RegExpLiteral':
        return this.visitRegExp(node as RegExpLiteral);
    }
  }

  protected visitTemplate(ctx: VisitContext, node: TemplateLiteral) {
    const { visitor } = ctx;
    return node.expressions
      .map((v) => visitor.next(ctx, v))
      .reduce(
        (previousValue, currentValue) =>
          `${Optional.ofNullable(previousValue).orElse('')}${Optional.ofNullable(currentValue).orElse('')}`
      );
  }

  protected visitRegExp(node: RegExpLiteral) {
    return node.pattern;
  }
}
