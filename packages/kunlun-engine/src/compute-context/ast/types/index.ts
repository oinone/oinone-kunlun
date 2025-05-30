import { AnyExpression, Declaration, Expression, Literal, Node, NodeType, Pattern, Statement } from './base';

export function createLiteral<T extends Literal>(type: T['type'], options: Omit<T, keyof Literal>): T {
  return {
    ...options,
    type,
    __node: true,
    __literal: true
  } as T;
}

export function createExpression<T extends Expression>(type: T['type'], options: Omit<T, keyof Expression>): T {
  return {
    ...options,
    type,
    __node: true,
    __expression: true
  } as T;
}

export function createStatement<T extends Statement>(type: T['type'], options: Omit<T, keyof Statement>): T {
  return {
    ...options,
    type,
    __node: true,
    __statement: true
  } as T;
}

export function createPattern<T extends Pattern>(type: T['type'], options: Omit<T, keyof Pattern>): T {
  return {
    ...options,
    type,
    __node: true,
    __pattern: true
  } as T;
}

export function createDeclaration<T extends Declaration>(type: T['type'], options: Omit<T, keyof Declaration>): T {
  return {
    ...options,
    type,
    __node: true,
    __declare: true
  } as T;
}

export function isNode(node: unknown): node is Node {
  return !!(node as Node).__node;
}

export function isLiteral(node: Node): node is Literal {
  return !!(node as Literal).__literal;
}

export function isExpression(node: Node): node is Expression {
  return !!(node as Expression).__expression;
}

export function isStatement(node: Node): node is Statement {
  return !!(node as Statement).__statement;
}

export function isPattern(node: Node): node is Pattern {
  return !!(node as Pattern).__pattern;
}

export function isDeclaration(node: Node): node is Declaration {
  return !!(node as Declaration).__declare;
}

export function getNodeType(node: Node): NodeType {
  if (isLiteral(node)) {
    return 'literal';
  }
  if (isExpression(node)) {
    return 'expression';
  }
  if (isStatement(node)) {
    return 'statement';
  }
  if (isPattern(node)) {
    return 'pattern';
  }
  if (isDeclaration(node)) {
    return 'declaration';
  }
  throw new Error('Invalid node.');
}

export function isAnyExpression(node: Node): node is AnyExpression {
  return isExpression(node) || isLiteral(node) || isPattern(node);
}

export * from './base';
export * from './expression';
export * from './literal';
export * from './parser';
export * from './pattern';
export * from './statement';
export * from './token';
export * from './visitor';
export * from './rsql';
