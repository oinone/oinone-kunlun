import * as charCodes from '../../charcodes';
import * as types from '../../tokens';
import {
  AnyExpression,
  ConditionalExpression,
  createExpression,
  isAnyExpression,
  Node,
  ParserContext,
  Token,
  TokenParser,
  TokenReader
} from '../../types';
import { BaseParser, BaseReader } from '../base';

export class ConditionOperatorReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new ConditionOperatorReader();

  public isSupported(context: ParserContext, code: number): boolean {
    const { node } = context;
    if (node && isAnyExpression(node)) {
      return code === charCodes.questionMark;
    }
    return false;
  }

  public read(context: ParserContext): Token | undefined {
    return this.finishRead(context, { type: types.conditional });
  }
}

export class ConditionOperatorParser extends BaseParser implements TokenParser {
  public static readonly INSTANCE = new ConditionOperatorParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    return token.type === types.conditional;
  }

  public parse(context: ParserContext, token: Token): Node | undefined {
    const { node } = context;
    if (!node) {
      throw new Error('Invalid conditional expression.');
    }
    const res = this.parseConditionalExpressionResult(context, token);
    if (!res) {
      return;
    }
    const { consequent, alternate } = res;
    return createExpression<ConditionalExpression>('ConditionalExpression', {
      test: node,
      consequent,
      alternate
    });
  }

  protected parseConditionalExpressionResult(
    context: ParserContext,
    token: Token
  ): { consequent: AnyExpression; alternate: AnyExpression } | undefined {
    const consequent = this.parseConsequentExpression(context, token);
    if (!consequent) {
      return undefined;
    }
    const alternate = this.parseAlternateExpression(context, token);
    if (!alternate) {
      return undefined;
    }
    return {
      consequent,
      alternate
    };
  }

  protected parseConsequentExpression(context: ParserContext, token: Token): AnyExpression | undefined {
    const subscript = this.parseSubscript(context, token);
    this.eat(context, types.colon);
    return subscript;
  }

  protected parseAlternateExpression(context: ParserContext, token: Token): AnyExpression | undefined {
    return this.parseSubscript(context, token);
  }
}
