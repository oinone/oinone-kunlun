/**
 * 事件键值定义
 */
export interface EventKeysDefinition {
  [key: string]: string;
}

/**
 * 事件管理器
 */
export interface EventManager<K extends EventKeysDefinition> {
  /**
   * 添加一个事件
   * @param event 事件键值
   * @param fn 事件处理函数
   */
  on(event: keyof K, fn: Function);

  /**
   * 清理一个事件
   * @param event 事件键值
   * @param fn 事件处理函数
   */
  clearOn(event: keyof K, fn: Function);

  /**
   * 执行指定事件键值的所有事件处理函数
   * @param event 事件键值
   * @param args 事件处理函数参数
   */
  notifyHandler(event: keyof K, ...args: unknown[]);
}
