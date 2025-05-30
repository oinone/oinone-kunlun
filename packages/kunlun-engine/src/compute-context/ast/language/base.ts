import * as types from '../tokens';
import { AnyExpression, Node, ParserContext, Token, TokenParser, TokenReader, TokenType } from '../types';
import { createParseContext } from '../utils/helper';

type ReadTextResult = {
  start: number;
  end: number;
  length: number;
  text: string;
};

export interface ReadTokenOptions {
  type: TokenType;
  length?: number;
  text?: string;
}

export abstract class BaseReader implements TokenReader {
  public abstract isSupported(context: ParserContext, code: number): boolean;

  public abstract read(context: ParserContext): Token | undefined;

  protected readText(context: ParserContext, length?: number): ReadTextResult {
    return this.$$readText(context, length);
  }

  private $$readText(context: ParserContext, length: number | undefined, text?: string): ReadTextResult {
    const { inputStream } = context;
    const start = inputStream.pos - 1;
    if (length == null) {
      length = 1;
    }
    const end = start + length;
    return {
      start,
      end,
      length,
      text: text || inputStream.source.substring(start, end)
    };
  }

  protected finishRead(context: ParserContext, options: ReadTokenOptions): Token {
    const { inputStream } = context;
    const { start, end, length, text } = this.$$readText(context, options.length, options.text);
    const token = {
      ...options,
      start,
      end,
      text
    };
    inputStream.skip(length - 1);
    return token;
  }
}

export abstract class BaseParser implements TokenParser {
  public abstract isSupported(context: ParserContext, token: Token): boolean;

  public abstract parse(context: ParserContext, token: Token): Node | undefined;

  protected eat(context: ParserContext, type: TokenType): boolean {
    const { tokens } = context;
    const lastToken = tokens[tokens.length - 1];
    if (lastToken?.type === type) {
      tokens.pop();
      return true;
    }
    return false;
  }

  protected parseAnyExpression(context: ParserContext, token: Token): AnyExpression | undefined {
    const res = this.parseAtomicExpression(context, token);
    if (!res) {
      return;
    }
    const { node, tokens } = res;
    context.tokens.push(...tokens);
    return node;
  }

  protected parseSubscript(context: ParserContext, token?: Token): AnyExpression | undefined {
    const { parser } = context;
    const res = this.parseAtomicExpression(context, token);
    if (!res) {
      return;
    }
    const { tokens } = res;
    do {
      const lastToken = tokens.pop();
      if (!lastToken) {
        break;
      }
      const nextNode = parser.nextNode(res, lastToken);
      if (nextNode) {
        res.node = nextNode;
      } else {
        context.tokens.push(...tokens, lastToken);
        return res.node;
      }
    } while (tokens.length);
    return res.node;
  }

  protected parseAtomicExpression(context: ParserContext, token?: Token, node?: Node): ParserContext {
    const currentBinop = token?.type.binop;
    const { parser, inputStream } = context;
    const subcontext = createParseContext({
      parser,
      inputStream,
      node
    });
    const { tokens } = subcontext;
    while (!inputStream.eof()) {
      let nextToken = tokens.pop();
      if (!nextToken) {
        nextToken = parser.nextToken(subcontext);
      }
      if (subcontext.node) {
        const { type } = nextToken;
        const { binop } = type;
        let nextNode: Node | undefined;
        if ([types.space, types.dot, types.questionDot, types._function].includes(type)) {
          nextNode = parser.nextNode(subcontext, nextToken);
        } else if (currentBinop != null && binop != null && currentBinop < binop) {
          nextNode = parser.nextNode(subcontext, nextToken);
        } else {
          subcontext.tokens.push(nextToken);
          return subcontext;
        }
        if (nextNode) {
          subcontext.node = nextNode;
        } else {
          subcontext.tokens.push(nextToken);
          return subcontext;
        }
      } else {
        subcontext.node = parser.nextNode(subcontext, nextToken);
      }
    }
    return subcontext;
  }

  protected parseArrayElements(context: ParserContext): Node[] {
    const { inputStream } = context;
    const nodes: Node[] = [];
    while (!inputStream.eof()) {
      const res = this.parseArrayElement(context);
      if (!res) {
        throw new Error('Invalid array element.');
      }
      const { node, isEnd } = res;
      if (node) {
        nodes.push(node);
      }
      if (isEnd) {
        break;
      }
    }
    return nodes;
  }

  protected parseArrayElement(context: ParserContext): { node: Node | undefined; isEnd: boolean } | undefined {
    const { parser, inputStream } = context;
    const subcontext = createParseContext({
      parser,
      inputStream
    });
    const { tokens } = subcontext;
    while (!inputStream.eof()) {
      let token = tokens.pop();
      if (!token) {
        token = parser.nextToken(subcontext);
      }
      if (this.isBrokenParseArrayElement(subcontext, token)) {
        return {
          node: subcontext.node,
          isEnd: this.isParseArrayElementEnd(context, token)
        };
      }
      subcontext.node = parser.nextNode(subcontext, token);
    }
    if (subcontext.node) {
      return {
        node: subcontext.node,
        isEnd: true
      };
    }
  }

  protected isBrokenParseArrayElement(context: ParserContext, token: Token): boolean {
    const { type } = token;
    return type === types.comma || this.isParseArrayElementEnd(context, token);
  }

  protected isParseArrayElementEnd(context: ParserContext, token: Token) {
    return token.type === types.bracketR;
  }
}
