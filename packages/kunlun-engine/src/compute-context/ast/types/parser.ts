import { InputStream } from '../utils';
import { Node } from './base';
import { Token } from './token';

/**
 * parser interface
 */
export interface IParser {
  /**
   * parse Node
   */
  parse(): Node;

  /**
   * parse next Node
   * @param context current parser context
   */
  next(context: ParserContext): Node;

  nextToken(context: ParserContext): Token;

  nextNode(context: ParserContext, token: Token): Node | undefined;
}

/**
 * parse context
 */
export interface ParserContext {
  parser: IParser;
  inputStream: InputStream;
  node?: Node;

  tokens: Token[];
}

/**
 * token reader
 */
export interface TokenReader {
  /**
   * this reader is supported for code
   * @param context {@link ParserContext}
   * @param code charCode
   */
  isSupported(context: ParserContext, code: number): boolean;

  /**
   * read source generator token
   * @param context {@link ParserContext}
   */
  read(context: ParserContext): Token | undefined;
}

/**
 * token parser
 */
export interface TokenParser {
  /**
   * this parser is supported token type
   * @param context {@link ParserContext}
   * @param token {@link Token}
   */
  isSupported(context: ParserContext, token: Token): boolean;

  /**
   * parse token to node
   * @param context
   * @param token
   */
  parse(context: ParserContext, token: Token): Node | undefined;
}
