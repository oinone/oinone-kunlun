import * as charCodes from '../charcodes';
import * as types from '../tokens';
import { createStatement, ExpressionStatement, Node, ParserContext, Token, TokenParser, TokenReader } from '../types';
import { BaseParser, BaseReader } from './base';

export class ParenReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new ParenReader();

  public isSupported(context: ParserContext, code: number): boolean {
    return code === charCodes.leftParenthesis;
  }

  public read(context: ParserContext): Token | undefined {
    return this.finishRead(context, { type: types.parenL });
  }
}

export class ParenParser extends BaseParser implements TokenParser {
  public static readonly INSTANCE = new ParenParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    return token.type === types.parenL;
  }

  public parse(context: ParserContext, token: Token): Node | undefined {
    const subscript = this.parseSubscript(context, token);
    if (!subscript) {
      return undefined;
    }
    this.eat(context, types.parenR);
    return createStatement<ExpressionStatement>('ExpressionStatement', {
      expression: subscript
    });
  }
}
