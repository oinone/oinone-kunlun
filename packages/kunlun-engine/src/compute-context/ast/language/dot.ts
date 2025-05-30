import * as charCodes from '../charcodes';
import * as types from '../tokens';
import {
  createExpression,
  isAnyExpression,
  MemberExpression,
  Node,
  ParserContext,
  Token,
  TokenParser,
  TokenReader
} from '../types';
import { createParseContext } from '../utils/helper';
import { BaseParser, BaseReader } from './base';
import { NumberReader } from './literal';
import { WordParser, WordReader } from './word';

export class DotReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new DotReader();

  public isSupported(context: ParserContext, code: number): boolean {
    if (code === charCodes.dot) {
      return true;
    }
    const { inputStream } = context;
    if (code === charCodes.questionMark && inputStream.peek() === charCodes.dot) {
      return true;
    }
    return false;
  }

  public read(context: ParserContext): Token | undefined {
    const { inputStream } = context;
    const next = inputStream.peek();
    if (NumberReader.INSTANCE.isSupported(context, next)) {
      return NumberReader.INSTANCE.read(context);
    }
    if (next === charCodes.dot) {
      if (inputStream.get() === charCodes.questionMark) {
        return this.finishRead(context, {
          type: types.questionDot,
          length: 2
        });
      }
      if (inputStream.peek(1) === charCodes.dot) {
        return this.finishRead(context, {
          type: types.ellipsis,
          length: 3
        });
      }
    }
    return this.finishRead(context, { type: types.dot });
  }
}

export class DotParser extends BaseParser implements TokenParser {
  public static readonly INSTANCE = new DotParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    return [types.dot, types.questionDot].includes(token.type);
  }

  public parse(context: ParserContext, token: Token): Node | undefined {
    const { parser, inputStream, node } = context;
    const subcontext = createParseContext({
      parser,
      inputStream
    });
    const type = node?.type;
    if (!type) {
      throw new Error('Invalid node.');
    }
    if (WordReader.INSTANCE.isSupported(context, inputStream.peek(token.text.length - 1)) && isAnyExpression(node)) {
      inputStream.skip(token.text.length);
      return createExpression<MemberExpression>('MemberExpression', {
        object: node,
        property: this.parseMemberProperty(subcontext)
      });
    }
    throw new Error('Invalid dot node.');
  }

  protected parseMemberProperty(context: ParserContext): Node {
    return this.parseWord(context);
  }

  protected parseWord(context: ParserContext): Node {
    const token = WordReader.INSTANCE.read(context);
    return WordParser.INSTANCE.parse(context, token);
  }
}
