import * as charCodes from '../../charcodes';
import * as types from '../../tokens';
import {
  createExpression,
  LogicalExpression,
  LogicalOperator,
  Node,
  ParserContext,
  Token,
  TokenParser,
  TokenReader,
  TokenType
} from '../../types';
import { BaseParser, BaseReader } from '../base';

export class LogicalOperatorReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new LogicalOperatorReader();

  public isSupported(context: ParserContext, code: number): boolean {
    const { inputStream } = context;
    const nextCode = inputStream.peek();
    if (code === charCodes.verticalBar && nextCode === charCodes.verticalBar) {
      return true;
    }
    if (code === charCodes.ampersand && nextCode === charCodes.ampersand) {
      return true;
    }
    return false;
  }

  public read(context: ParserContext): Token | undefined {
    const { inputStream } = context;
    const code = inputStream.get();
    const nextCode = inputStream.peek();
    if (code === charCodes.verticalBar && nextCode === charCodes.verticalBar) {
      return this.finishRead(context, {
        type: new TokenType(types.operator.keyword, { binop: types.logicalOR.binop }),
        length: 2
      });
    }
    if (code === charCodes.ampersand && nextCode === charCodes.ampersand) {
      return this.finishRead(context, {
        type: new TokenType(types.operator.keyword, { binop: types.logicalAND.binop }),
        length: 2
      });
    }
  }
}

export class LogicalOperatorParser extends BaseParser implements TokenParser {
  public static readonly INSTANCE = new LogicalOperatorParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    const { type, text } = token;
    return type.keyword === types.operator.keyword && ['||', '&&'].includes(text);
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
    return createExpression<LogicalExpression>('LogicalExpression', {
      operator: token.text as LogicalOperator,
      left: node,
      right
    });
  }
}
