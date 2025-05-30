/**
 * 单堆栈存储
 */
export type StackStore = string[];

/**
 * 多堆栈存储
 */
export type StackStores = { key: string; stack: StackStore }[];

/**
 * 返回路由
 */
export interface BackRouter {
  /**
   * 后退
   */
  back(): void;
}

/**
 * 前进路由
 */
export interface ForwardRouter {
  /**
   * 前进
   */
  forward(): void;
}

/**
 * 单堆栈路由
 */
export interface SingleStackRouter extends BackRouter, ForwardRouter {
  /**
   * 入栈
   * @param url 目标url
   * @param go 是否跳转
   */
  push(url: string, go?: boolean);
}

/**
 * 多堆栈路由
 */
export interface MultiStackRouter extends SingleStackRouter {
  /**
   * 获取当前激活Key
   */
  getActiveKey(): string | undefined;

  /**
   * 获取当前堆栈
   */
  getCurrentStack(): StackStore;

  /**
   * 获取全部堆栈
   */
  getAllStacks(): StackStores;
}
