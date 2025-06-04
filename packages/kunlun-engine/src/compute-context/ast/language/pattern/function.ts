import {
  COLLECTION_FUNCTION,
  CONVERT_FUNCTION,
  DATETIME_FUNCTION,
  LOGIC_FUNCTION,
  MATCH_FUNCTION,
  MATH_FUNCTION,
  OBJECT_FUNCTION,
  STRING_FUNCTION
} from '@oinone/kunlun-expression';
import * as charCodes from '../../charcodes';
import * as types from '../../tokens';
import {
  CallExpression,
  createExpression,
  isAnyExpression,
  isIdentifier,
  Node,
  ParserContext,
  Token,
  TokenParser,
  TokenReader
} from '../../types';
import { BaseParser, BaseReader } from '../base';

const STATIC_FUNCTION = {
  ...COLLECTION_FUNCTION,
  ...CONVERT_FUNCTION,
  ...DATETIME_FUNCTION,
  ...LOGIC_FUNCTION,
  ...MATCH_FUNCTION,
  ...MATH_FUNCTION,
  ...OBJECT_FUNCTION,
  ...STRING_FUNCTION
};

export class FunctionReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new FunctionReader();

  public isSupported(context: ParserContext, code: number): boolean {
    const { node } = context;
    if (node && isAnyExpression(node)) {
      return code === charCodes.leftParenthesis;
    }
    return false;
  }

  public read(context: ParserContext): Token | undefined {
    return this.finishRead(context, { type: types._function });
  }
}

export class FunctionParser extends BaseParser implements TokenParser {
  public static readonly INSTANCE = new FunctionParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    return token.type === types._function;
  }

  public parse(context: ParserContext, token: Token): Node | undefined {
    const { node } = context;
    if (node && isAnyExpression(node)) {
      let invoke: Function | undefined;
      if (isIdentifier(node)) {
        const functionInstance = STATIC_FUNCTION[node.value];
        if (functionInstance) {
          invoke = functionInstance;
        }
      }
      return createExpression<CallExpression>('CallExpression', {
        method: node,
        arguments: this.parseArrayElements(context),
        invoke
      });
    }
  }

  protected isParseArrayElementEnd(context: ParserContext, token: Token) {
    return token.type === types.parenR;
  }
}
