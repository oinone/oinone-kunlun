import {
  AnyExpression,
  ArrayPattern,
  BooleanLiteral,
  Literal,
  NumberLiteral,
  RSQLAnyExpression,
  RSQLStringLiteral,
  StringLiteral,
  TemplateLiteral,
  VisitContext
} from '../../types';
import { RSQLArrayPattern } from '../../types/rsql/pattern';
import { VisitorAdapter } from '../visit';
import { StringAdapter, StringAdapterContext } from './adapter';

export class RSQLStringAdapter extends StringAdapter implements VisitorAdapter<StringAdapterContext> {
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
        value = `${quote}${stringLiteral.value}${quote}`;
        break;
      }
      case 'RSQLStringLiteral': {
        const rsqlStringLiteral = node as RSQLStringLiteral;
        let quote = "'";
        if (rsqlStringLiteral.quote) {
          quote = '"';
        }
        value = `${quote}${this.visitTemplateLiteral(ctx, node as TemplateLiteral)}${quote}`;
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

  protected visitTemplateExpression(ctx: VisitContext<StringAdapterContext>, node: AnyExpression): string {
    let value = this.convert(ctx, node);
    if (node.type === 'StringLiteral') {
      value = value.substring(1, value.length - 1);
    } else {
      let marker = '';
      const markerCode = (node as RSQLAnyExpression).marker;
      if (markerCode != null) {
        marker = String.fromCharCode(markerCode);
      }
      value = `\$${marker}{${value}}`;
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
}

export const RSQLStringAdapterInstance = new RSQLStringAdapter();
