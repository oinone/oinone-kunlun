import * as charCodes from '../charcodes';
import * as types from '../tokens';
import { ParserContext, Token, TokenReader } from '../types';
import { BaseReader } from './base';

export class EndReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new EndReader();

  public isSupported(context: ParserContext, code: number): boolean {
    return [
      charCodes.rightParenthesis,
      charCodes.rightSquareBracket,
      charCodes.rightCurlyBrace,
      charCodes.colon
    ].includes(code);
  }

  public read(context: ParserContext): Token | undefined {
    const { inputStream } = context;
    switch (inputStream.get()) {
      case charCodes.rightParenthesis:
        return this.finishRead(context, { type: types.parenR });
      case charCodes.rightSquareBracket:
        return this.finishRead(context, { type: types.bracketR });
      case charCodes.rightCurlyBrace:
        return this.finishRead(context, { type: types.braceR });
      case charCodes.colon:
        return this.finishRead(context, { type: types.colon });
    }
  }
}
