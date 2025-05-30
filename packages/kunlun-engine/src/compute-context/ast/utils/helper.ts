import { ParserContext } from '../types';

export function createParseContext(context: Pick<ParserContext, 'parser' | 'inputStream' | 'node'>): ParserContext {
  return {
    ...context,
    tokens: []
  };
}
