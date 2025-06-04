import { RSQLOperators, StringHelper } from '@oinone/kunlun-shared';
import * as charCodes from '../../../charcodes';
import * as types from '../../../tokens';
import { ParserContext, Token, TokenParser, TokenReader, TokenType } from '../../../types';
import { BaseReader } from '../../base';
import { BinaryOperatorParser } from '../../operator';

export class RSQLBinaryOperatorReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new RSQLBinaryOperatorReader();

  public isSupported(context: ParserContext, code: number): boolean {
    if (!context.node) {
      return false;
    }
    // < || >
    if ([charCodes.lessThan, charCodes.greaterThan].includes(code)) {
      return true;
    }

    const { inputStream } = context;
    let nextCode = inputStream.peek();

    // !=
    if (code === charCodes.exclamationMark) {
      if (nextCode === charCodes.equalsTo) {
        return true;
      }
    }

    if (code === charCodes.equalsTo) {
      // ==
      if (nextCode === charCodes.equalsTo) {
        return true;
      }

      // =*=
      let i = 1;
      while (i < RSQLOperators.MAX_OPERATOR_SIZE && StringHelper.isLetter(nextCode)) {
        nextCode = inputStream.peek(i);
        if (nextCode === charCodes.equalsTo) {
          return true;
        }
        i++;
      }
    }
    return false;
  }

  public read(context: ParserContext): Token | undefined {
    const { inputStream } = context;
    const code = inputStream.get();
    let length = 1;
    if ([charCodes.lessThan, charCodes.greaterThan, charCodes.exclamationMark].includes(code)) {
      length++;
    }
    let nextCode = inputStream.peek();
    if (nextCode === charCodes.equalsTo) {
      length++;
    }

    let i = 0;
    while (i < RSQLOperators.MAX_OPERATOR_SIZE && StringHelper.isLetter(nextCode) && nextCode !== charCodes.equalsTo) {
      nextCode = inputStream.peek(i);
      i++;
    }
    length += i;

    const { text } = this.readText(context, length);
    return this.finishRead(context, {
      type: new TokenType(types.operator.keyword),
      length,
      text
    });
  }
}

export class RSQLBinaryOperatorParser extends BinaryOperatorParser implements TokenParser {
  public static readonly INSTANCE = new RSQLBinaryOperatorParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    if (!context.node) {
      return false;
    }
    const { type, text } = token;
    if (type.keyword !== types.operator.keyword) {
      return false;
    }
    for (const operator of RSQLOperators.operators()) {
      if (operator.symbols.some((symbol) => symbol === text)) {
        return true;
      }
    }
    return false;
  }
}
