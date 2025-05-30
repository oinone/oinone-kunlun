import { IParser, Node, ParserContext, Token, TokenParser, TokenReader } from '../types';
import { InputStream } from '../utils';
import { createParseContext } from '../utils/helper';
import { getOptions, Options } from './options';

export class Parser implements IParser {
  protected readonly source: string;

  protected readonly options: Options;

  public constructor(source: string, options?: Partial<Options>) {
    this.source = source;
    this.options = getOptions(options);
  }

  protected init(): ParserContext {
    const input = this.source.trim();
    // const isBlockMode = this.options.block;
    // if (isBlockMode) {
    //   if (
    //     input.charCodeAt(0) !== charCodes.leftCurlyBrace &&
    //     input.charCodeAt(input.length - 1) !== charCodes.rightCurlyBrace
    //   ) {
    //     input = `{${input}}`;
    //   }
    // }
    return createParseContext({
      parser: this,
      inputStream: new InputStream(input)
    });
  }

  public parse(): Node {
    const context = this.init();
    const token = this.nextToken(context);
    context.node = this.nextNode(context, token);
    return this.next(context);
  }

  public next(context: ParserContext): Node {
    const { inputStream, tokens } = context;
    while (!inputStream.eof()) {
      let token = tokens.pop();
      if (!token) {
        token = this.nextToken(context);
      }
      const nextNode = this.nextNode(context, token);
      if (nextNode) {
        context.node = nextNode;
      }
    }
    const { node } = context;
    if (!node) {
      throw new Error('Invalid node.');
    }
    return node;
  }

  public nextToken(context: ParserContext): Token {
    const { inputStream } = context;
    const code = inputStream.next();
    const token = this.readToken(context, code, (reader) => reader.read(context));
    if (!token) {
      throw new Error(`Invalid token. code=${code}`);
    }
    return token;
  }

  protected readToken(
    context: ParserContext,
    code: number,
    consumer: (reader: TokenReader) => Token | undefined
  ): Token | undefined {
    const { language } = this.options;
    let res = language.getReader(context, code);
    while (res) {
      const { reader, index } = res;
      const token = consumer(reader);
      if (token) {
        return token;
      }
      res = language.getReader(context, code, index + 1);
    }
  }

  public nextNode(context: ParserContext, token: Token): Node | undefined {
    return this.parseToken(context, token, (parser) => parser.parse(context, token));
  }

  protected parseToken(
    context: ParserContext,
    token: Token,
    consumer: (parser: TokenParser) => Node | undefined
  ): Node | undefined {
    const { language } = this.options;
    let res = language.getParser(context, token);
    while (res) {
      const { parser, index } = res;
      const node = consumer(parser);
      if (node) {
        return node;
      }
      res = language.getParser(context, token, index + 1);
    }
  }
}
