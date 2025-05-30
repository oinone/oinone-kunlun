import * as charCodes from '../charcodes';
import * as types from '../tokens';
import { ParserContext, Token, TokenReader } from '../types';
import { BaseReader } from './base';

export class CommaReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new CommaReader();

  public isSupported(context: ParserContext, code: number): boolean {
    return code === charCodes.comma;
  }

  public read(context: ParserContext): Token | undefined {
    return this.finishRead(context, { type: types.comma });
  }
}
