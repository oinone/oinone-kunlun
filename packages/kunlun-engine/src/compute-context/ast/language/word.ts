import * as charCodes from '../charcodes';
import * as types from '../tokens';
import {
  BooleanLiteral,
  createLiteral,
  createPattern,
  Identifier,
  Node,
  NullLiteral,
  ParserContext,
  Token,
  TokenParser,
  TokenReader,
  UndefinedLiteral
} from '../types';
import { BaseParser, BaseReader } from './base';
import { NumberReader } from './literal';

export class WordReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new WordReader();

  public isSupported(context: ParserContext, code: number): boolean {
    if ((charCodes.chineseBegin <= code && code <= charCodes.chineseEnd) || code >= charCodes.chineseOverflow) {
      return true;
    }
    if (code < charCodes.uppercaseA) {
      return code === charCodes.dollarSign;
    }
    if (code <= charCodes.uppercaseZ) {
      return true;
    }
    if (code < charCodes.lowercaseA) {
      return code === charCodes.underscore;
    }
    return code <= charCodes.lowercaseZ;
  }

  public read(context: ParserContext): Token {
    const { inputStream } = context;
    let length = 0;
    let cc: number;
    let nonEof = false;
    do {
      cc = inputStream.peek(length);
      if (length >= 1) {
        nonEof = NumberReader.INSTANCE.isSupported(context, cc) || this.isSupported(context, cc);
      } else {
        nonEof = this.isSupported(context, cc);
      }
      length++;
    } while (nonEof);
    return this.finishRead(context, {
      type: types.word,
      length
    });
  }
}

export class WordParser extends BaseParser implements TokenParser {
  public static readonly INSTANCE = new WordParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    return token.type === types.word;
  }

  public parse(context: ParserContext, token: Token): Node {
    switch (token.text) {
      case 'true':
        return this.createBooleanLiteral(true);
      case 'false':
        return this.createBooleanLiteral(false);
      case 'undefined':
        return createLiteral<UndefinedLiteral>('UndefinedLiteral', {});
      case 'null':
        return createLiteral<NullLiteral>('NullLiteral', {});
    }
    return createPattern<Identifier>('Identifier', {
      value: token.text
    });
  }

  protected createBooleanLiteral(value: boolean) {
    return createLiteral<BooleanLiteral>('BooleanLiteral', { value });
  }
}
