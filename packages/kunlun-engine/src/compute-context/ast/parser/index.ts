import { isNode, Node } from '../types';
import { Options } from './options';
import { Parser } from './parser';

export function rawParser(source: string, options?: Partial<Options>): Node {
  return new Parser(source, options).parse();
}

export function parser(expression: string | Node, options?: Partial<Options>): Node | undefined {
  if (expression == null) {
    return expression;
  }
  let node: Node | undefined;
  if (typeof expression === 'string') {
    try {
      node = rawParser(expression, options);
    } catch (e) {
      console.error('Invalid expression.', expression, e);
      return undefined;
    }
  } else if (isNode(expression)) {
    node = expression;
  }
  if (!node) {
    console.error('Invalid expression.', expression);
  }
  return node;
}

export * from './options';
export * from './parser';
