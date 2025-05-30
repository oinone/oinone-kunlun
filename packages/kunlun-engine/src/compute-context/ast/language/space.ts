import * as charCodes from '../charcodes';
import * as types from '../tokens';
import { Node, ParserContext, Token, TokenParser, TokenReader } from '../types';
import { BaseReader } from './base';

export class SpaceReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new SpaceReader();

  public isSupported(context: ParserContext, code: number): boolean {
    const { inputStream } = context;
    switch (code) {
      case charCodes.space:
      case charCodes.nonBreakingSpace:
      case charCodes.tab:
        return true;
      case charCodes.carriageReturn:
        if (inputStream.peek(1) === charCodes.lineFeed) {
          return true;
        }
      // eslint-disable-next-line no-fallthrough
      case charCodes.lineFeed:
      case charCodes.lineSeparator:
      case charCodes.paragraphSeparator:
        return true;
    }
    return isWhitespace(code);
  }

  public read(context: ParserContext): Token | undefined {
    const { inputStream } = context;
    let length = 0;
    let cc: number;
    do {
      cc = inputStream.peek(length++);
    } while (this.isSupported(context, cc));
    return this.finishRead(context, {
      type: types.space,
      length
    });
  }
}

export class SpaceParser implements TokenParser {
  public static readonly INSTANCE = new SpaceParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    return token.type === types.space;
  }

  public parse(context: ParserContext, token: Token): Node | undefined {
    return context.node;
  }
}

// https://tc39.github.io/ecma262/#sec-white-space
function isWhitespace(code: number): boolean {
  switch (code) {
    case 0x0009: // CHARACTER TABULATION
    case 0x000b: // LINE TABULATION
    case 0x000c: // FORM FEED
    case charCodes.space:
    case charCodes.nonBreakingSpace:
    case charCodes.oghamSpaceMark:
    case 0x2000: // EN QUAD
    case 0x2001: // EM QUAD
    case 0x2002: // EN SPACE
    case 0x2003: // EM SPACE
    case 0x2004: // THREE-PER-EM SPACE
    case 0x2005: // FOUR-PER-EM SPACE
    case 0x2006: // SIX-PER-EM SPACE
    case 0x2007: // FIGURE SPACE
    case 0x2008: // PUNCTUATION SPACE
    case 0x2009: // THIN SPACE
    case 0x200a: // HAIR SPACE
    case 0x202f: // NARROW NO-BREAK SPACE
    case 0x205f: // MEDIUM MATHEMATICAL SPACE
    case 0x3000: // IDEOGRAPHIC SPACE
    case 0xfeff: // ZERO WIDTH NO-BREAK SPACE
      return true;
    default:
      return false;
  }
}
