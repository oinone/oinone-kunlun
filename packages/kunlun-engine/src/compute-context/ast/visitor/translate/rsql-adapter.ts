import { BooleanHelper, RSQLOperators } from '@kunlun/shared';
import {
  ArrayPattern,
  BinaryExpression,
  BooleanLiteral,
  Identifier,
  Literal,
  NumberLiteral,
  StringLiteral,
  TemplateLiteral,
  VisitContext
} from '../../types';
import { RSQLArrayPattern } from '../../types/rsql/pattern';
import { StringAdapterContext } from '../to-string';
import { VisitorAdapter } from '../visit';
import { TranslateAdapter } from './adapter';

export class RSQLTranslateAdapter extends TranslateAdapter implements VisitorAdapter<StringAdapterContext> {
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
      case 'RSQLStringLiteral':
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

  protected translateIdentifier(node: Identifier) {
    const { value } = node;
    const tokenValue = this.locale.token[value];
    if (tokenValue) {
      return tokenValue;
    }
    let { currentModelField } = this;
    if (!currentModelField) {
      if (!this.currentModel) {
        currentModelField = this.originModel?.modelFields?.find((v) => v.data === value);
      }
    }
    const fieldDisplayName = currentModelField?.displayName;
    if (fieldDisplayName) {
      return fieldDisplayName;
    }
    return value;
  }

  public visitArrayPattern(ctx: VisitContext<StringAdapterContext>, node: ArrayPattern): boolean {
    let flagL = '[';
    let flagR = ']';
    if ((node as RSQLArrayPattern).paren) {
      flagL = '(';
      flagR = ')';
    }
    this.appendResult(ctx, `${flagL}${node.elements.map((v) => this.convert(ctx, v)).join(', ')}${flagR}`);
    return false;
  }

  public visitBinaryExpression(ctx: VisitContext<StringAdapterContext>, node: BinaryExpression): boolean {
    const { operator, left, right } = node;
    let result: string | undefined;
    const rightResult = this.convert(ctx, right);
    if (RSQLOperators.IS_NULL.isSymbolEquals(operator)) {
      if (BooleanHelper.isStringBoolean(rightResult)) {
        if (BooleanHelper.isTrue(rightResult)) {
          result = this.locale.operator[RSQLOperators.IS_NULL.symbol] || operator;
        } else {
          result = this.locale.operator[RSQLOperators.IS_NOT_NULL.symbol] || operator;
        }
      }
    }
    if (RSQLOperators.IS_NOT_NULL.isSymbolEquals(operator)) {
      if (BooleanHelper.isStringBoolean(rightResult)) {
        if (BooleanHelper.isTrue(rightResult)) {
          result = this.locale.operator[RSQLOperators.IS_NOT_NULL.symbol] || operator;
        } else {
          result = this.locale.operator[RSQLOperators.IS_NULL.symbol] || operator;
        }
      }
    }
    if (result) {
      this.appendResult(ctx, `${this.convert(ctx, left)} ${result}`);
      return false;
    }
    this.appendResult(ctx, `${this.convert(ctx, left)} ${this.locale.operator[operator] || operator} ${rightResult}`);
    return false;
  }
}
