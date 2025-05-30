import * as charCodes from '../../charcodes';
import * as types from '../../tokens';
import {
  createExpression,
  ParserContext,
  Token,
  TokenParser,
  TokenReader,
  UnaryExpression,
  UnaryOperator
} from '../../types';
import { BaseParser, BaseReader } from '../base';

export class UnaryOperatorReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new UnaryOperatorReader();

  public isSupported(context: ParserContext, code: number): boolean {
    return [charCodes.dash, charCodes.plusSign, charCodes.exclamationMark, charCodes.tilde].includes(code);
  }

  public read(context: ParserContext): Token | undefined {
    const { text } = this.readText(context);
    return this.finishRead(context, {
      type: types.unaryOperator,
      length: 1,
      text
    });
  }
}

export class UnaryOperatorParser extends BaseParser implements TokenParser {
  public static readonly INSTANCE = new UnaryOperatorParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    const { type, text } = token;
    return type === types.unaryOperator && ['-', '+', '!', '~'].includes(text);
  }

  public parse(context: ParserContext, token: Token): UnaryExpression | undefined {
    const right = this.parseAnyExpression(context, token);
    if (!right) {
      return;
    }
    return createExpression<UnaryExpression>('UnaryExpression', {
      operator: token.text as UnaryOperator,
      prefix: true,
      argument: right
    });
  }
}
