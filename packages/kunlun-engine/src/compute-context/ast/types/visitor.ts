import { Node } from './base';

export type TokenContext = Record<string, unknown>;

/**
 * visitor interface
 */
export interface IVisitor<C extends TokenContext = TokenContext, R = unknown> {
  /**
   * visit Root Node
   * @param root Root Node
   */
  visit(root: Node): R;

  /**
   * visit next Node
   * @param ctx current visitor context
   * @param node target node
   */
  next(ctx: VisitContext<C>, node: Node): R;
}

export interface VisitContext<C extends TokenContext = TokenContext> {
  visitor: IVisitor;
  context: C;
  globalContext: Record<string, unknown>;
}

/**
 * Node Visitor
 */
export interface NodeVisitor<N extends Node = Node, C extends TokenContext = TokenContext, R = unknown> {
  /**
   * this visitor is supported node type
   * @param node target node
   */
  isSupported(node: Node): boolean;

  /**
   * visit a Node
   * @param ctx context
   * @param node target node
   */
  visit(ctx: VisitContext<C>, node: N): R;
}
