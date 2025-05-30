import { ReturnPromise } from '../typing';

/**
 * 事件函数
 */
type EmitEventFunction = Function | ((...args) => ReturnPromise<void>);

/**
 * 真实调用的事件函数
 */
type EmitEventReturnFunction = (...args) => Promise<void>;

/**
 * 使用异步调用函数（事件函数执行的任何异常都将被忽略）
 * @param fn 事件函数
 */
export function emitEvent<T extends EmitEventFunction>(fn: T): EmitEventReturnFunction {
  return async (...args): Promise<void> => {
    try {
      await fn(...args);
    } catch (e) {
      console.error(e);
    }
  };
}
