import * as charCodes from '../../../charcodes';
import * as types from '../../../tokens';
import {
  AnyExpression,
  createLiteral,
  isStringLiteral,
  Node,
  ParserContext,
  RSQLAnyExpression,
  RSQLStringLiteral,
  StringLiteral,
  Token,
  TokenParser,
  TokenReader
} from '../../../types';
import { InputStream } from '../../../utils';
import { createParseContext } from '../../../utils/helper';
import { BaseParser } from '../../base';
import { StringReader } from '../../literal';

interface PositionItem {
  pos: number;
  marker?: number;
}

export class RSQLStringReader extends StringReader implements TokenReader {
  public static readonly INSTANCE = new RSQLStringReader();
}

export class RSQLStringParser extends BaseParser implements TokenParser {
  public static readonly INSTANCE = new RSQLStringParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    return token.type === types.string;
  }

  public parse(context: ParserContext, token: Token): Node {
    return this.generatorNode(context, token.text);
  }

  protected generatorNode(context: ParserContext, value: string): StringLiteral | RSQLStringLiteral {
    const text = value.substring(1, value.length - 1);
    const quote = text.charCodeAt(0) === charCodes.quotationMark;
    const expressions = this.generatorExpressions(context, text);
    if (expressions.length === 1) {
      const firstExpression = expressions[0];
      if (isStringLiteral(firstExpression)) {
        firstExpression.quote = quote;
        return firstExpression;
      }
    }
    return createLiteral<RSQLStringLiteral>('RSQLStringLiteral', {
      expressions,
      quote
    });
  }

  protected generatorExpressions(context: ParserContext, text: string): RSQLAnyExpression[] {
    const expressions: RSQLAnyExpression[] = [];
    const inputStream = new InputStream(text);
    const stack: PositionItem[] = [];
    let startElement = -1;
    let endElement = -1;

    let cc: number;
    while (!inputStream.eof()) {
      cc = inputStream.next();
      if (cc === charCodes.dollarSign) {
        cc = inputStream.peek();
        const marker = this.isExtensionMarker(cc);
        if (marker != null) {
          inputStream.skip(1);
          cc = inputStream.peek();
        }
        if (cc === charCodes.leftCurlyBrace) {
          stack.push({
            pos: inputStream.pos,
            marker
          });
          inputStream.skip(1);
          appendTemplateElement();
        }
      } else if (cc === charCodes.rightCurlyBrace) {
        const start = stack.pop();
        if (start == null) {
          markTemplateElement();
        } else {
          const expression = this.generatorExpression(context, text.substring(start.pos + 1, inputStream.pos - 1));
          if (expression) {
            (expression as RSQLAnyExpression).marker = start.marker;
            expressions.push(expression);
          }
        }
      } else if (!stack.length) {
        markTemplateElement();
      }
    }
    appendTemplateElement();
    return expressions;

    function markTemplateElement() {
      if (startElement === -1) {
        startElement = inputStream.pos;
        endElement = inputStream.pos;
      } else {
        endElement = inputStream.pos;
      }
    }

    function appendTemplateElement() {
      if (startElement !== -1 && endElement !== -1) {
        let _startElement = startElement - 1;
        if (_startElement < 0) {
          _startElement = 0;
        }
        expressions.push(
          createLiteral<StringLiteral>('StringLiteral', {
            value: text.substring(_startElement, endElement)
          })
        );
        startElement = -1;
        endElement = -1;
      }
    }
  }

  protected generatorExpression(context: ParserContext, expression: string): AnyExpression | undefined {
    const { parser } = context;
    const subcontext = createParseContext({
      parser,
      inputStream: new InputStream(expression)
    });
    return this.parseSubscript(subcontext);
  }

  /**
   * ! || # || ?
   * @param code
   * @protected
   */
  protected isExtensionMarker(code: number): number | undefined {
    for (const marker of [charCodes.exclamationMark, charCodes.numberSign, charCodes.questionMark]) {
      if (marker === code) {
        return marker;
      }
    }
    return undefined;
  }
}
