import * as types from '../../tokens';
import {
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
import { RSQLArrayPattern } from '../../types/rsql/pattern';
import { ParenParser, ParenReader } from '../paren';

export class RSQLParenReader extends ParenReader implements TokenReader {
  public static readonly INSTANCE = new RSQLParenReader();

  // public isSupported(context: ParserContext, code: number): boolean {
  //   return [charCodes.leftParenthesis, charCodes.leftSquareBracket].includes(code);
  // }
  //
  // public read(context: ParserContext): Token | undefined {
  //   const { inputStream } = context;
  //   const code = inputStream.peek();
  //   if (code === charCodes.leftParenthesis) {
  //     return this.finishRead(context, { type: types.parenL });
  //   }
  //   if (code === charCodes.leftSquareBracket) {
  //     return this.finishRead(context, { type: types.bracketL });
  //   }
  // }
}

export class RSQLParenParser extends ParenParser implements TokenParser {
  public static readonly INSTANCE = new RSQLParenParser();

  // public isSupported(context: ParserContext, token: Token): boolean {
  //   const { type } = token;
  //   return type === types.parenL || type === types.bracketL;
  // }

  public parse(context: ParserContext, token: Token): Node | undefined {
    const { node } = context;
    const elements = this.parseArrayElements(context);
    if (isIdentifier(node) && elements.length === 1) {
      return createExpression<MemberExpression>('MemberExpression', {
        object: node,
        property: elements[0]
      });
    }
    return createPattern<RSQLArrayPattern>('ArrayPattern', {
      elements,
      paren: true
    });
  }

  protected isParseArrayElementEnd(context: ParserContext, token: Token) {
    return token.type === types.parenR;
  }
}
