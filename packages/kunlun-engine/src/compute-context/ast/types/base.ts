/**
 * 任意节点
 */
export type Node = {
  type: string;
  __node?: true;
};

/**
 * 字面量节点
 */
export type Literal = Node & {
  __literal?: true;
};

/**
 * 表达式节点
 */
export type Expression = Node & {
  __expression?: true;
};

/**
 * 片段节点
 */
export type Statement = Node & {
  __statement?: true;
};

/**
 * 匹配节点
 */
export type Pattern = Node & {
  __pattern?: true;
};

/**
 * 声明节点
 */
export type Declaration = Node & {
  __declare?: true;
};

/**
 * 节点类型
 */
export type NodeType = 'literal' | 'expression' | 'statement' | 'pattern' | 'declaration';

/**
 * 任意表达式
 */
export type AnyExpression = Expression | Literal | Pattern;
