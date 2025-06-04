import { BigNumber } from '@oinone/kunlun-shared';
import { AnyExpression, Literal, Node } from './base';

/**
 * undefined
 */
export type UndefinedLiteral = Literal & {
  type: 'UndefinedLiteral';
};

/**
 * null
 */
export type NullLiteral = Literal & {
  type: 'NullLiteral';
};

/**
 * '{@link StringLiteral#value}'
 */
export type StringLiteral = Literal & {
  type: 'StringLiteral';
  value: StringLiteralValueType;
  quote?: boolean;
};

/**
 * \`{@link TemplateLiteral#value}\`
 */
export type TemplateLiteral = Literal & {
  type: 'TemplateLiteral';
  expressions: TemplateLiteralValueType;
};

/**
 * number
 */
export type NumberLiteral = Literal & {
  type: 'NumberLiteral';
  value: NumberLiteralValueType;
};

/**
 * boolean
 */
export type BooleanLiteral = Literal & {
  type: 'BooleanLiteral';
  value: BooleanLiteralValueType;
};

/**
 * reg
 */
export type RegExpLiteral = Literal & {
  type: 'RegExpLiteral';
  pattern: RegExpLiteralValueType;
};

export function isUndefinedLiteral(node: Node | undefined): node is UndefinedLiteral {
  return node?.type === 'UndefinedLiteral';
}

export function isNullLiteral(node: Node | undefined): node is NullLiteral {
  return node?.type === 'NullLiteral';
}

export function isStringLiteral(node: Node | undefined): node is StringLiteral {
  return node?.type === 'StringLiteral';
}

export function isTemplateLiteral(node: Node | undefined): node is TemplateLiteral {
  return node?.type === 'TemplateLiteral';
}

export function isNumberLiteral(node: Node | undefined): node is NumberLiteral {
  return node?.type === 'NumberLiteral';
}

export function isBooleanLiteral(node: Node | undefined): node is BooleanLiteral {
  return node?.type === 'BooleanLiteral';
}

export function isRegExpLiteral(node: Node | undefined): node is RegExpLiteral {
  return node?.type === 'RegExpLiteral';
}

type UndefinedLiteralValueType = undefined;

type NullLiteralValueType = null;

type StringLiteralValueType = string;

type TemplateLiteralValueType = AnyExpression[];

type NumberLiteralValueType = number | bigint | BigNumber;

type BooleanLiteralValueType = boolean;

type RegExpLiteralValueType = RegExp;

type LiteralValueType<T extends Literal> = T extends UndefinedLiteral
  ? UndefinedLiteralValueType
  : T extends NullLiteral
  ? NullLiteralValueType
  : T extends StringLiteral
  ? StringLiteralValueType
  : T extends TemplateLiteral
  ? TemplateLiteralValueType
  : T extends NumberLiteral
  ? NumberLiteralValueType
  : T extends BooleanLiteral
  ? BooleanLiteralValueType
  : T extends RegExpLiteral
  ? RegExpLiteralValueType
  : unknown;

type GetLiteralValueResult<T extends Literal> = { isStatic: boolean; value: LiteralValueType<T> };

export function getLiteralValue<T extends Literal>(node: T): GetLiteralValueResult<T> | undefined {
  if (isUndefinedLiteral(node)) {
    return { isStatic: true, value: undefined } as GetLiteralValueResult<T>;
  }
  if (isNullLiteral(node)) {
    return { isStatic: true, value: null } as GetLiteralValueResult<T>;
  }
  if (isStringLiteral(node) || isNumberLiteral(node) || isBooleanLiteral(node)) {
    return { isStatic: true, value: node.value } as GetLiteralValueResult<T>;
  }
  if (isTemplateLiteral(node)) {
    return { isStatic: false, value: node.expressions } as GetLiteralValueResult<T>;
  }
  if (isRegExpLiteral(node)) {
    return { isStatic: true, value: node.pattern } as GetLiteralValueResult<T>;
  }
}
