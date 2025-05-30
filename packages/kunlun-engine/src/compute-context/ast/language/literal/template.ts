import * as charCodes from '../../charcodes';
import * as types from '../../tokens';
import {
  AnyExpression,
  createLiteral,
  Node,
  ParserContext,
  TemplateLiteral,
  Token,
  TokenParser,
  TokenReader
} from '../../types';
import { InputStream } from '../../utils';
import { createParseContext } from '../../utils/helper';
import { BaseParser, ReadTokenOptions } from '../base';
import { StringReader } from './string';

export class TemplateReader extends StringReader implements TokenReader {
  public static readonly INSTANCE = new TemplateReader();

  public isSupported(context: ParserContext, code: number): boolean {
    return [charCodes.graveAccent].includes(code);
  }

  protected finishRead(context: ParserContext, options: ReadTokenOptions): Token {
    return super.finishRead(context, {
      ...options,
      type: types.template
    });
  }
}

export class TemplateParser extends BaseParser implements TokenParser {
  public static readonly INSTANCE = new TemplateParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    return token.type === types.template;
  }

  public parse(context: ParserContext, token: Token): Node {
    return this.generatorNode(context, token.text);
  }

  protected generatorNode(context: ParserContext, value: string): TemplateLiteral {
    const text = value.substring(1, value.length - 1);
    return createLiteral('TemplateLiteral', {
      expressions: this.generatorExpressions(context, text)
    });
  }

  protected generatorExpressions(context: ParserContext, text: string): AnyExpression[] {
    const expressions: AnyExpression[] = [];
    const inputStream = new InputStream(text);
    const stack: number[] = [];
    let startElement = -1;
    let endElement = -1;

    let cc: number;
    while (!inputStream.eof()) {
      cc = inputStream.next();
      if (cc === charCodes.dollarSign) {
        cc = inputStream.peek();
        if (cc === charCodes.leftCurlyBrace) {
          stack.push(inputStream.pos);
          inputStream.skip(1);
          appendTemplateElement();
        }
      } else if (cc === charCodes.rightCurlyBrace) {
        const start = stack.pop();
        if (start == null) {
          markTemplateElement();
        } else {
          const expression = this.generatorExpression(context, text.substring(start + 1, inputStream.pos - 1));
          if (expression) {
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
          createLiteral('StringLiteral', {
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
}
