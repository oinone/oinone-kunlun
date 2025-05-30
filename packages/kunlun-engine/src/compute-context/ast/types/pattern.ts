import { AnyExpression, Expression, Node, Pattern } from './base';
import { StringLiteral } from './literal';

/**
 * 基础对象成员节点
 */
export type ObjectMemberBase = Expression & {
  key: StringLiteral;
  value: AnyExpression;
};

/**
 * 对象属性
 */
export type ObjectProperty = ObjectMemberBase & {
  type: 'ObjectProperty';
};

/**
 * 对象方法（暂不支持，仅用于保持类型声明完整性）
 */
export type ObjectMethod = ObjectMemberBase & {
  type: 'ObjectMethod';
};

/**
 * 对象成员
 */
export type ObjectMember = ObjectProperty | ObjectMethod;

/**
 * 标识符匹配 keyword
 */
export type Identifier = Pattern & {
  type: 'Identifier';
  value: string;
};

/**
 * 对象匹配 {}
 */
export type ObjectPattern = Pattern & {
  type: 'ObjectPattern';
  properties: ReadonlyArray<ObjectMember>;
};

/**
 * 数组匹配 []
 */
export type ArrayPattern = Pattern & {
  type: 'ArrayPattern';
  elements: ReadonlyArray<AnyExpression>;
};

export function isIdentifier(node: Node | undefined): node is Identifier {
  return node?.type === 'Identifier';
}
