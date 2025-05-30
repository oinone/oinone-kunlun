import { BigNumber } from '@kunlun/shared';
import * as charCodes from '../../charcodes';
import * as types from '../../tokens';
import {
  createLiteral,
  Node,
  NumberLiteral,
  ParserContext,
  StringLiteral,
  Token,
  TokenParser,
  TokenReader,
  TokenType
} from '../../types';
import { BaseReader } from '../base';

export class NumberReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new NumberReader();

  private static readonly INT_MAX_LENGTH = 15;

  public isSupported(context: ParserContext, code: number): boolean {
    return code >= charCodes.digit0 && code <= charCodes.digit9;
  }

  public read(context: ParserContext): Token | undefined {
    const { inputStream } = context;
    let length = 0;
    let integerLength = 0;
    let cc = inputStream.get();
    const startWithDot = cc === charCodes.dot;
    let isDecimal = false;
    while (this.isSupported(context, cc) || cc === charCodes.dot) {
      cc = inputStream.peek(length++);
      if (cc === charCodes.dot) {
        if (isDecimal) {
          return undefined;
        }
        isDecimal = true;
      }
      if (!isDecimal) {
        integerLength++;
      }
    }
    if (startWithDot) {
      if (isDecimal) {
        throw new Error(`Invalid number. source=${inputStream.source}, pos=${inputStream.pos}`);
      }
    }
    let type: TokenType;
    if (isDecimal) {
      if (integerLength <= NumberReader.INT_MAX_LENGTH) {
        type = types.number;
      } else {
        type = types.bignumber;
      }
    } else if (integerLength <= NumberReader.INT_MAX_LENGTH) {
      type = types.int;
    } else {
      type = types.bigint;
    }
    return this.finishRead(context, {
      type,
      length
    });
  }
}

export class NumberParser implements TokenParser {
  public static readonly INSTANCE = new NumberParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    return [types.int, types.bigint, types.number, types.bignumber].includes(token.type);
  }

  public parse(context: ParserContext, token: Token): Node | undefined {
    const { type, text } = token;
    switch (type) {
      case types.int:
      case types.number:
        return this.generatorNode(Number(text));
      case types.bigint:
        // return this.generatorNode(BigInt(text));
        return this.generatorStringNode(text);
      case types.bignumber:
        return this.generatorNode(new BigNumber(text));
    }
    return undefined;
  }

  protected generatorStringNode(value: string): StringLiteral {
    return createLiteral<StringLiteral>('StringLiteral', { value });
  }

  protected generatorNode(value: number | bigint | BigNumber): NumberLiteral {
    return createLiteral<NumberLiteral>('NumberLiteral', { value });
  }
}
