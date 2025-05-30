import * as charCodes from '../../charcodes';
import * as types from '../../tokens';
import {
  ArrayPattern,
  createExpression,
  createPattern,
  isIdentifier,
  MemberExpression,
  Node,
  ParserContext,
  Token,
  TokenParser,
  TokenReader
} from '../../types';
import { BaseParser, BaseReader } from '../base';

export class ArrayReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new ArrayReader();

  public isSupported(context: ParserContext, code: number): boolean {
    return code === charCodes.leftSquareBracket;
  }

  public read(context: ParserContext): Token | undefined {
    return this.finishRead(context, { type: types.bracketL });
  }
}

export class ArrayParser extends BaseParser implements TokenParser {
  public static readonly INSTANCE = new ArrayParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    return token.type === types.bracketL;
  }

  public parse(context: ParserContext, token: Token): Node | undefined {
    const { node } = context;
    const elements = this.parseArrayElements(context);
    if (isIdentifier(node) && elements.length === 1) {
      return createExpression<MemberExpression>('MemberExpression', {
        object: node,
        property: elements[0]
      });
    }
    return createPattern<ArrayPattern>('ArrayPattern', {
      elements
    });
  }
}
