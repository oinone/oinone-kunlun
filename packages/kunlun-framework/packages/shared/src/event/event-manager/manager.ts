import { isNil } from 'lodash-es';
import { ReturnPromise } from '../../typing';
import { emitEvent } from '../emit-event';
import { EventKeysDefinition, EventManager } from './typing';

type KeyOfType = string | number | symbol;

type FunctionOfPriority = Function & { priority?: number };

function orderByPriority(a: FunctionOfPriority, b: FunctionOfPriority): number {
  const ap = a.priority;
  const bp = b.priority;
  const apn = isNil(ap);
  const bpn = isNil(bp);
  if (apn && bpn) {
    return 0;
  }
  if (apn) {
    return 1;
  }
  if (bpn) {
    return -1;
  }
  if (ap === bp) {
    return 0;
  }
  if (ap < bp) {
    return -1;
  }
  return 1;
}

/**
 * 抽象事件管理器
 */
export abstract class AbstractEventManager<K extends EventKeysDefinition> {
  protected readonly eventHandlerMap = new Map<KeyOfType, FunctionOfPriority[]>();

  /**
   * 事件订阅
   * @param event 事件key
   * @param fn 执行函数
   * @param priority 优先级（从小到大）
   */
  public on(event: keyof K, fn: Function, priority?: number) {
    let handlers = this.eventHandlerMap.get(event);
    if (!handlers) {
      handlers = [];
      this.eventHandlerMap.set(event, handlers);
    }
    if (priority) {
      (fn as FunctionOfPriority).priority = priority;
    }
    handlers.push(fn);
  }

  /**
   * 清除事件订阅
   * @param event 事件key
   * @param fn 执行函数
   */
  public clearOn(event: keyof K, fn: Function) {
    const handlers = this.eventHandlerMap.get(event);
    if (!handlers) {
      return;
    }
    const index = handlers.findIndex((v) => v === fn);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * 通知所有处理者
   * @param event 事件key
   * @param args 执行参数
   */
  public abstract notifyHandler(event: keyof K, ...args: unknown[]): ReturnPromise<void>;
}

/**
 * 非阻塞事件管理器
 */
export class NonBlockingEventManager<K extends EventKeysDefinition> extends AbstractEventManager<K> {
  /**
   * 异步执行指定事件键值的所有事件处理函数
   * @param event 事件键值
   * @param args 事件处理函数参数
   */
  public notifyHandler(event: keyof K, ...args: unknown[]) {
    this.eventHandlerMap
      .get(event)
      ?.sort(orderByPriority)
      .forEach((fn) => emitEvent(fn)(...args));
  }
}

/**
 * 阻塞事件管理器
 */
export class BlockingEventManager<K extends EventKeysDefinition> extends AbstractEventManager<K> {
  /**
   * 执行指定事件键值的所有事件处理函数
   * @param event 事件键值
   * @param args 事件处理函数参数
   */
  public async notifyHandler(event: keyof K, ...args: unknown[]): Promise<void> {
    await Promise.allSettled(
      this.eventHandlerMap
        .get(event)
        ?.sort(orderByPriority)
        .map(async (fn) => fn(...args)) || []
    );
  }
}

/**
 * 事件处理函数
 */
export type StandardEventHandler<
  K extends EventKeysDefinition = EventKeysDefinition,
  Manager extends EventManager<K> = EventManager<K>
> = (manager: Manager, ...args) => void;

/**
 * 标准事件管理器
 */
export class StandardEventManager<K extends EventKeysDefinition> extends NonBlockingEventManager<K> {
  /**
   * 事件订阅
   * @param event 事件key
   * @param fn 执行函数
   * @param priority 优先级（从小到大）
   */
  public on(event: keyof K, fn: StandardEventHandler<K, this>, priority?: number) {
    super.on(event, fn, priority);
  }

  /**
   * 清除事件订阅
   * @param event 事件key
   * @param fn 执行函数
   */
  public clearOn(event: keyof K, fn: StandardEventHandler<K, this>) {
    super.clearOn(event, fn);
  }

  /**
   * 通知所有处理者
   * @param event 事件key
   * @param args 执行参数
   */
  public notifyHandler(event: keyof K, ...args: unknown[]) {
    super.notifyHandler(event, this, ...args);
  }
}
