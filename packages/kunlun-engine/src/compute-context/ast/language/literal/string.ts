import * as charCodes from '../../charcodes';
import * as types from '../../tokens';
import { createLiteral, Node, ParserContext, StringLiteral, Token, TokenParser, TokenReader } from '../../types';
import { BaseReader } from '../base';

export class StringReader extends BaseReader implements TokenReader {
  public static readonly INSTANCE = new StringReader();

  public isSupported(context: ParserContext, code: number): boolean {
    return [charCodes.apostrophe, charCodes.quotationMark].includes(code);
  }

  public read(context: ParserContext): Token | undefined {
    const { inputStream } = context;
    const first = inputStream.get();
    const stack: number[] = [first];
    const escapePos: number[] = [];
    let isEscape = false;
    let length = 0;
    let cc: number;
    do {
      cc = inputStream.peek(length++);
      if (this.isSupported(context, cc)) {
        if (isEscape) {
          isEscape = false;
          escapePos.push(length - 1);
          continue;
        }
        if (!this.stackPop(stack, cc)) {
          stack.push(cc);
        }
      } else if (cc === charCodes.backslash) {
        if (inputStream.peek(length + 1) !== charCodes.backslash) {
          isEscape = true;
          continue;
        } else {
          escapePos.push(length);
          length++;
        }
      }
      isEscape = false;
    } while (!Number.isNaN(cc) && stack.length);
    if (!stack.length) {
      const { length: finalLength, text } = this.readText(context, length + 1);
      let finalText = text;
      if (escapePos.length) {
        finalText = this.clearEscape(finalText, escapePos);
      }
      return this.finishRead(context, {
        type: types.string,
        length: finalLength,
        text: finalText
      });
    }
  }

  protected clearEscape(text: string, escapePos: number[]): string {
    let start = 0;
    let finalText = '';
    for (const pos of escapePos) {
      finalText = `${finalText}${text.substring(start, pos)}`;
      start = pos + 1;
    }
    if (start < text.length) {
      finalText = `${finalText}${text.substring(start)}`;
    }
    return finalText;
  }

  protected stackPop(stack: number[], cc: number): boolean {
    let matchIndex = -1;
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i] === cc) {
        matchIndex = i;
        break;
      }
    }
    if (matchIndex !== -1) {
      stack.splice(matchIndex, stack.length - matchIndex);
      return true;
    }
    return false;
  }
}

export class StringParser implements TokenParser {
  public static readonly INSTANCE = new StringParser();

  public isSupported(context: ParserContext, token: Token): boolean {
    return token.type === types.string;
  }

  public parse(context: ParserContext, token: Token): Node | undefined {
    return this.generatorNode(token.text);
  }

  protected generatorNode(value: string): StringLiteral {
    const quote = value.charCodeAt(0) === charCodes.quotationMark;
    return createLiteral<StringLiteral>('StringLiteral', {
      value: value.substring(1, value.length - 1),
      quote
    });
  }
}
