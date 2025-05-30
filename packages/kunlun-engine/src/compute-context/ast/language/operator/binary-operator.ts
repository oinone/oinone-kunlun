import * as charCodes from '../../charcodes';
import * as types from '../../tokens';
import { getBinopByKey } from '../../tokens';
import {
  BinaryExpression,
  BinaryOperator,
  createExpression,
  ParserContext,
  Token,
  TokenParser,
  TokenReader,
  TokenType
} from '../../types';
import { BaseParser, BaseReader } from '../base';

export class BinaryOperatorReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new BinaryOperatorReader();

  public isSupported(context: ParserContext, code: number): boolean {
    if (!context.node) {
      return false;
    }
    // + || - || * || / || % || ^ || < || >
    if (
      [
        charCodes.plusSign,
        charCodes.dash,
        charCodes.asterisk,
        charCodes.slash,
        charCodes.percentSign,
        charCodes.caret,
        charCodes.lessThan,
        charCodes.greaterThan
      ].includes(code)
    ) {
      return true;
    }

    const { inputStream } = context;
    const nextCode = inputStream.peek();

    // == || === || != || !==
    if ([charCodes.equalsTo, charCodes.exclamationMark].includes(code)) {
      if (nextCode === charCodes.equalsTo) {
        return true;
      }
    }
    // & || |
    if (
      [charCodes.verticalBar, charCodes.ampersand].includes(code) &&
      ![charCodes.verticalBar, charCodes.ampersand].includes(nextCode)
    ) {
      return true;
    }
    return false;
  }

  public read(context: ParserContext): Token | undefined {
    const { inputStream } = context;
    const code = inputStream.get();
    let length = 1;
    if ([charCodes.equalsTo, charCodes.exclamationMark].includes(code)) {
      length++;
      if (inputStream.peek(1) === charCodes.equalsTo) {
        length++;
      }
    }
    const nextCode = inputStream.peek();
    if (code === charCodes.asterisk && nextCode === charCodes.asterisk) {
      length++;
    }
    if (code === charCodes.lessThan && [charCodes.equalsTo, charCodes.lessThan].includes(nextCode)) {
      length++;
    }
    if (code === charCodes.greaterThan && [charCodes.equalsTo, charCodes.greaterThan].includes(nextCode)) {
      length++;
      if (inputStream.peek(1) === charCodes.greaterThan) {
        length++;
      }
    }
    const { text } = this.readText(context, length);
    return this.finishRead(context, {
      type: new TokenType(types.operator.keyword, { binop: getBinopByKey(text) }),
      length,
      text
    });
  }
}

export class BinaryOperatorParser extends BaseParser implements TokenParser {
  public static readonly INSTANCE = new BinaryOperatorParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    if (!context.node) {
      return false;
    }
    const { type, text } = token;
    return (
      type.keyword === types.operator.keyword &&
      [
        '+',
        '-',
        '*',
        '/',
        '==',
        '===',
        '!=',
        '!==',
        '<',
        '<=',
        '>',
        '>=',

        '%',
        '**',

        '&',
        '|',
        '^',
        '<<',
        '>>',
        '>>>'
      ].includes(text)
    );
  }

  public parse(context: ParserContext, token: Token): BinaryExpression | undefined {
    const { node } = context;
    if (!node) {
      throw new Error('Invalid binary operator.');
    }
    const right = this.parseAnyExpression(context, token);
    if (!right) {
      return;
    }
    return createExpression<BinaryExpression>('BinaryExpression', {
      operator: token.text as BinaryOperator,
      left: node,
      right
    });
  }
}
