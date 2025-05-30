import {
  AnyExpression,
  ArrayPattern,
  BinaryExpression,
  BooleanLiteral,
  CallExpression,
  ConditionalExpression,
  ExpressionStatement,
  Identifier,
  Literal,
  LogicalExpression,
  MemberExpression,
  Node,
  NumberLiteral,
  StringLiteral,
  TemplateLiteral,
  UnaryExpression,
  VisitContext
} from '../../types';
import { AdapterContext, VisitorAdapter } from '../visit';

export interface StringAdapterContext extends AdapterContext {
  result?: string;
}

export class StringAdapter implements VisitorAdapter<StringAdapterContext> {
  public visitLiteral(ctx: VisitContext<StringAdapterContext>, node: Literal): boolean {
    const { type } = node;
    let value: string | undefined;
    switch (type) {
      case 'UndefinedLiteral':
        value = 'undefined';
        break;
      case 'NullLiteral':
        value = 'null';
        break;
      case 'StringLiteral': {
        const stringLiteral = node as StringLiteral;
        let quote = "'";
        if (stringLiteral.quote) {
          quote = '"';
        }
        value = `${quote}${(node as StringLiteral).value}${quote}`;
        break;
      }
      case 'TemplateLiteral':
        value = `\`${this.visitTemplateLiteral(ctx, node as TemplateLiteral)}\``;
        break;
      case 'NumberLiteral':
        value = `${(node as NumberLiteral).value}`;
        break;
      case 'BooleanLiteral':
        value = `${(node as BooleanLiteral).value}`;
        break;
    }
    this.appendResult(ctx, value, true);
    return false;
  }

  public visitIdentifier(ctx: VisitContext<StringAdapterContext>, node: Identifier): boolean {
    this.appendResult(ctx, node.value);
    return false;
  }

  public visitExpressionStatement(ctx: VisitContext<StringAdapterContext>, node: ExpressionStatement): boolean {
    this.appendResult(ctx, `(${this.convert(ctx, node.expression)})`);
    return false;
  }

  public visitArrayPattern(ctx: VisitContext<StringAdapterContext>, node: ArrayPattern): boolean {
    this.appendResult(ctx, `[${node.elements.map((v) => this.convert(ctx, v)).join(', ')}]`);
    return false;
  }

  public visitCallExpression(ctx: VisitContext<StringAdapterContext>, node: CallExpression): boolean {
    this.appendResult(
      ctx,
      `${this.convert(ctx, node.method)}(${node.arguments.map((v) => this.convert(ctx, v)).join(', ')})`
    );
    return false;
  }

  public visitBinaryExpression(ctx: VisitContext<StringAdapterContext>, node: BinaryExpression): boolean {
    this.appendResult(ctx, `${this.convert(ctx, node.left)} ${node.operator} ${this.convert(ctx, node.right)}`);
    return false;
  }

  public visitUnaryExpression(ctx: VisitContext<StringAdapterContext>, node: UnaryExpression): boolean {
    this.appendResult(ctx, `${node.operator}${this.convert(ctx, node.argument)}`, true);
    return false;
  }

  public visitConditionalExpression(ctx: VisitContext<StringAdapterContext>, node: ConditionalExpression): boolean {
    this.appendResult(
      ctx,
      `${this.convert(ctx, node.test)} ? ${this.convert(ctx, node.consequent)} : ${this.convert(ctx, node.alternate)}`,
      true
    );
    return false;
  }

  public visitLogicalExpression(ctx: VisitContext<StringAdapterContext>, node: LogicalExpression): boolean {
    this.appendResult(ctx, `${this.convert(ctx, node.left)} ${node.operator} ${this.convert(ctx, node.right)}`);
    return false;
  }

  public visitMemberExpression(ctx: VisitContext<StringAdapterContext>, node: MemberExpression): boolean {
    this.appendResult(ctx, `${this.convert(ctx, node.object)}.${this.convert(ctx, node.property)}`);
    return false;
  }

  protected visitTemplateLiteral(ctx: VisitContext<StringAdapterContext>, node: TemplateLiteral): string {
    return `${node.expressions.map((v) => this.visitTemplateExpression(ctx, v)).join('')}`;
  }

  protected visitTemplateExpression(ctx: VisitContext<StringAdapterContext>, node: AnyExpression): string {
    let value = this.convert(ctx, node);
    if (node.type === 'StringLiteral') {
      value = value.substring(1, value.length - 1);
    } else {
      value = `\${${value}}`;
    }
    return value;
  }

  protected appendResult(ctx: VisitContext<StringAdapterContext>, value: string | undefined, space?: boolean) {
    if (!value) {
      return;
    }
    const result = ctx.context.result || '';
    let finalResult: string;
    if (result) {
      if (space) {
        finalResult = `${result} ${value}`;
      } else {
        finalResult = `${result}${value}`;
      }
    } else {
      finalResult = value || '';
    }
    ctx.context.result = finalResult;
  }

  protected convert(ctx: VisitContext<StringAdapterContext>, node: Node): string {
    const { visitor, context } = ctx;
    const { result } = context;
    context.result = '';
    visitor.next(ctx, node);
    const template = context.result;
    context.result = result;
    return template;
  }
}

export const StringAdapterInstance = new StringAdapter();
