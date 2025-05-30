export interface ContextNode<T extends ContextNode<T>> {
  /**
   * 唯一键
   */
  handle: string;
  /**
   * 父上下文
   */
  parentContext?: T;
  /**
   * 子上下文
   */
  childrenContext: T[];
}
