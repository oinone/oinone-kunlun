import { ParserContext, Token, TokenParser, TokenReader } from '../types';

export interface LanguageOptions {
  readers?: TokenReader[];
  parsers?: TokenParser[];
}

export class Language {
  private readonly readers: TokenReader[];

  private readonly parsers: TokenParser[];

  public constructor(options?: LanguageOptions) {
    this.readers = options?.readers || [];
    this.parsers = options?.parsers || [];
  }

  public getReader(
    context: ParserContext,
    code: number,
    offset?: number
  ): { reader: TokenReader; index: number } | undefined {
    for (let index = offset || 0; index < this.readers.length; index++) {
      const reader = this.readers[index];
      if (reader.isSupported(context, code)) {
        return {
          reader,
          index
        };
      }
    }
    return undefined;
  }

  public getParser(
    context: ParserContext,
    token: Token,
    offset?: number
  ): { parser: TokenParser; index: number } | undefined {
    for (let index = offset || 0; index < this.parsers.length; index++) {
      const parser = this.parsers[index];
      if (parser.isSupported(context, token)) {
        return {
          parser,
          index
        };
      }
    }
    return undefined;
  }
}
