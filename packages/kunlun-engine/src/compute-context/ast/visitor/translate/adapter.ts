import { isRelationField } from '../../../../runtime-context';
import { RuntimeModel, RuntimeModelField } from '../../../../runtime-metadata';
import { TokenPropertiesManager } from '../../manager';
import { parser } from '../../parser';
import {
  AnyExpression,
  ArrayPattern,
  BinaryExpression,
  BooleanLiteral,
  CallExpression,
  ConditionalExpression,
  Identifier,
  isIdentifier,
  Literal,
  LogicalExpression,
  MemberExpression,
  Node,
  NumberLiteral,
  StringLiteral,
  TemplateLiteral,
  VisitContext
} from '../../types';
import { Executor } from '../executor';
import { Optimize } from '../optimize';
import { StringAdapter, StringAdapterContext } from '../to-string';
import { VisitorAdapter } from '../visit';
import { ExpressionLocaleManager } from './expression-locale';
import { ExpressionLocaleType } from './language';

export interface TranslateAdapterOptions {
  model?: RuntimeModel;
  tokenProperties?: string[];
  locale?: ExpressionLocaleType;
}

export class TranslateAdapter extends StringAdapter implements VisitorAdapter<StringAdapterContext> {
  protected locale: ExpressionLocaleType;

  protected tokenProperties: string[];

  protected originModel: RuntimeModel | undefined;

  protected currentModel: RuntimeModel | undefined;

  protected currentModelField: RuntimeModelField | undefined;

  public constructor(options?: TranslateAdapterOptions) {
    super();
    this.originModel = options?.model;
    this.tokenProperties = options?.tokenProperties || TokenPropertiesManager.get();
    this.locale = options?.locale || ExpressionLocaleManager.get();
  }

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
      case 'StringLiteral':
        value = `${(node as StringLiteral).value}`;
        break;
      case 'TemplateLiteral':
        value = this.visitTemplateLiteral(ctx, node as TemplateLiteral);
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

  protected visitTemplateLiteral(ctx: VisitContext<StringAdapterContext>, node: TemplateLiteral): string {
    return `${node.expressions
      .map((v) => this.visitTemplateExpression(ctx, v))
      .join(` ${this.locale.operator['+']} `)}`;
  }

  protected visitTemplateExpression(ctx: VisitContext<StringAdapterContext>, node: AnyExpression): string {
    return this.convert(ctx, node);
  }

  public visitIdentifier(ctx: VisitContext<StringAdapterContext>, node: Identifier): boolean {
    this.appendResult(ctx, this.translateIdentifier(node));
    return false;
  }

  protected translateIdentifier(node: Identifier) {
    const { value } = node;
    const tokenValue = this.locale.token[value];
    if (tokenValue) {
      return tokenValue;
    }
    const fieldDisplayName = this.currentModelField?.displayName;
    if (fieldDisplayName) {
      return fieldDisplayName;
    }
    return value;
  }

  public visitArrayPattern(ctx: VisitContext<StringAdapterContext>, node: ArrayPattern): boolean {
    this.appendResult(ctx, `[${node.elements.map((v) => this.convert(ctx, v)).join(', ')}]`);
    return false;
  }

  public visitCallExpression(ctx: VisitContext<StringAdapterContext>, node: CallExpression): boolean {
    const { method: methodNode } = node;
    let method: string | undefined;
    if (isIdentifier(methodNode)) {
      method = this.locale.function[methodNode.value] || methodNode.value;
    }
    if (!method) {
      method = this.convert(ctx, node.method);
    }
    let args: string[] | string = node.arguments.map((v) => this.convert(ctx, v));
    const finalMethod = this.processCallExpressionLocale(method, args);
    if (finalMethod && finalMethod !== method) {
      this.appendResult(ctx, finalMethod);
      return false;
    }
    if (Array.isArray(args)) {
      args = args.join(', ');
    }
    this.appendResult(ctx, `${method}(${args})`);
    return false;
  }

  public visitBinaryExpression(ctx: VisitContext<StringAdapterContext>, node: BinaryExpression): boolean {
    this.appendResult(
      ctx,
      `${this.convert(ctx, node.left)} ${this.locale.operator[node.operator] || node.operator} ${this.convert(
        ctx,
        node.right
      )}`
    );
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
    this.appendResult(
      ctx,
      `${this.convert(ctx, node.left)} ${this.locale.operator[node.operator] || node.operator} ${this.convert(
        ctx,
        node.right
      )}`
    );
    return false;
  }

  public visitMemberExpression(ctx: VisitContext<StringAdapterContext>, node: MemberExpression): boolean {
    const { object: objectNode, property: propertyNode } = node;

    const object = this.convert(ctx, objectNode);

    if (this.isTokenIdentifier(objectNode)) {
      this.currentModel = this.originModel;
      this.currentModelField = undefined;
    }

    if (isIdentifier(propertyNode)) {
      if (!this.currentModelField) {
        this.currentModelField = this.findField(propertyNode.value);
      } else if (isRelationField(this.currentModelField)) {
        this.currentModel = this.currentModelField.referencesModel;
        this.currentModelField = this.findField(propertyNode.value);
      } else {
        this.currentModel = undefined;
        this.currentModelField = undefined;
      }
    }

    const property = this.convert(ctx, propertyNode);

    this.appendResult(ctx, `${object}.${property}`);
    return false;
  }

  protected isTokenIdentifier(node: Node): boolean {
    return !!(isIdentifier(node) && this.tokenProperties.length && this.tokenProperties.includes(node.value));
  }

  protected findField(data: string): RuntimeModelField | undefined {
    return this.currentModel?.modelFields?.find((v) => v.data === data);
  }

  protected processCallExpressionLocale(locale: string, args: string[]): string | null | undefined {
    try {
      const node = parser(locale);
      if (!node) {
        return locale;
      }
      const context = { args };
      TokenPropertiesManager.using(Array.from(Object.keys(context)), () => {
        Optimize.run(node);
      });
      return Executor.run(node, { context });
    } catch (e) {
      console.error(e);
      return locale;
    }
  }
}
