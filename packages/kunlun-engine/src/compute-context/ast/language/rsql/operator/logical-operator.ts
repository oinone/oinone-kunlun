import { RSQLLogicalOperator, RSQLLogicalOperators } from '@oinone/kunlun-shared';
import * as types from '../../../tokens';
import {
  createExpression,
  Node,
  ParserContext,
  RSQLLogicalExpression,
  Token,
  TokenParser,
  TokenReader,
  TokenType
} from '../../../types';
import { BaseParser, BaseReader } from '../../base';

export class RSQLLogicalOperatorReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new RSQLLogicalOperatorReader();

  public isSupported(context: ParserContext, code: number): boolean {
    const { inputStream } = context;
    const nextCode1 = inputStream.peek();
    if (RSQLLogicalOperators.isOr(String.fromCharCode(code, nextCode1))) {
      return true;
    }
    const nextCode2 = inputStream.peek(1);
    if (RSQLLogicalOperators.isAnd(String.fromCharCode(code, nextCode1, nextCode2))) {
      return true;
    }
    return false;
  }

  public read(context: ParserContext): Token | undefined {
    const { inputStream } = context;
    const code = inputStream.get();
    const nextCode1 = inputStream.peek();
    if (RSQLLogicalOperators.isOr(String.fromCharCode(code, nextCode1))) {
      return this.finishRead(context, {
        type: new TokenType(types.operator.keyword, { binop: types.logicalOR.binop }),
        text: RSQLLogicalOperator.OR,
        length: RSQLLogicalOperator.OR.length
      });
    }
    const nextCode2 = inputStream.peek(1);
    if (RSQLLogicalOperators.isAnd(String.fromCharCode(code, nextCode1, nextCode2))) {
      return this.finishRead(context, {
        type: new TokenType(types.operator.keyword, { binop: types.logicalAND.binop }),
        text: RSQLLogicalOperator.AND,
        length: RSQLLogicalOperator.AND.length
      });
    }
  }
}

export class RSQLLogicalOperatorParser extends BaseParser implements TokenParser {
  public static readonly INSTANCE = new RSQLLogicalOperatorParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    const { type, text } = token;
    return (
      type.keyword === types.operator.keyword &&
      ([RSQLLogicalOperator.OR, RSQLLogicalOperator.AND] as string[]).includes(text)
    );
  }

  public parse(context: ParserContext, token: Token): Node | undefined {
    const { node } = context;
    if (!node) {
      throw new Error('Invalid logical operator.');
    }
    const right = this.parseAnyExpression(context, token);
    if (!right) {
      return;
    }
    return createExpression<RSQLLogicalExpression>('RSQLLogicalExpression', {
      operator: token.text as RSQLLogicalOperator,
      left: node,
      right
    });
  }
}
