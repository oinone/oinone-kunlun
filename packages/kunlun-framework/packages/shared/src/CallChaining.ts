import { isNil } from 'lodash-es';
import { ReturnPromise } from './typing';

export type CallFunction<T = unknown, R = void> = ((
  args: unknown[] | undefined,
  callBeforeResult: T | undefined,
  lastCallResult?: T | undefined
) => ReturnPromise<R>) & {
  priority?: number;
};

export type CallBeforeFunction<R = unknown> = (...args: unknown[]) => ReturnPromise<R>;

export type CallAfterFunction<T = unknown> = (
  args: unknown[] | undefined,
  callBeforeResult: T | undefined,
  callAfterResult: CallAfterResult<T | undefined>
) => ReturnPromise<T>;

export interface CallFunctionOptions {
  /**
   * 强制替换
   */
  force?: boolean;
  /**
   * 不可变（当强制替换为true时，默认为true）
   */
  immutable?: boolean;
}

interface CallItem {
  path: string;
  priority?: number;
}

export interface CallAfterResult<T> {
  status: boolean;
  results: T[];
}

/**
 * <h3>链式调用（钩子）</h3>
 * <p>
 * 在一个组件树中，很多时候我们是无法明确知道多个子组件甚至更深层级的子组件之间是如何协同并正确执行某些特定逻辑的。
 * 比如，在一个表格视图中的一个表格组件需要定义一个搜索功能时，我们并不希望这个表格组件只有一种搜索形式，而是搭配其他任何的搜索组件都可以实现统一的逻辑处理。
 * 也就是说，它自己本身并不能直接定义搜索形式。在这种情况下，表格的搜索功能是通过外部传递的，可能是平级组件，也可能在这个表格视图的任何地方。
 * 在这样的背景下，我们想到可以在表格视图中定义一个链式调用对象（钩子），通过provider向下传递，表格组件实现hook函数，搜索组件实现call调用，这样就可以实现组件间解耦。
 * 对搜索功能的抽象，使得表格组件不再关心搜索的形式。搜索组件只要按照表格组件定义的搜索规范传递参数，并使用对应的链式调用对象（钩子），就可以让与之相关的表格组件重新获取数据，达到搜索的目的。
 * 简而言之，这样的设计方式，更像是一个滑轮的两端，不管任何一端被拉动，另一端都会产生对应的响应。
 * </p>
 */
export class CallChaining<T = unknown> {
  public static readonly MAX_PRIORITY = 0;

  public static readonly MIN_PRIORITY = 99999;

  private static counter = 0;

  private readonly key: string;

  private chains = new Map<string, CallFunction<T, unknown>>();

  private immutableBeforeFn = false;

  private beforeFn: CallBeforeFunction<T> | undefined;

  private immutableAfterFn = false;

  private afterFn: CallAfterFunction<T> | undefined;

  private called = false;

  public constructor() {
    this.key = `call-chaining-${CallChaining.counter++}`;
  }

  public hook<R = void>(path: string, fn: CallFunction<T, R>, priority?: number) {
    const finalFn = fn as CallFunction<T, unknown>;
    if (priority != null) {
      if (priority > CallChaining.MIN_PRIORITY) {
        priority = CallChaining.MIN_PRIORITY;
        console.warn(`the minimum call chaining hook priority is ${CallChaining.MIN_PRIORITY}.`);
      } else if (priority < CallChaining.MAX_PRIORITY) {
        priority = CallChaining.MAX_PRIORITY;
        console.warn(`the maximum call chaining hook priority is ${CallChaining.MAX_PRIORITY}.`);
      }
      finalFn.priority = priority;
    }
    this.chains.set(path, finalFn);
  }

  public unhook<R = void>(path: string): CallFunction<T, R> | undefined {
    const fn = this.chains.get(path);
    if (fn) {
      this.chains.delete(path);
    }
    return fn as CallFunction<T, R>;
  }

  public callBefore(fn: CallBeforeFunction<T>, options?: CallFunctionOptions): void {
    if (!this.beforeFn) {
      this.beforeFn = fn;
      if (options?.immutable) {
        this.immutableBeforeFn = true;
      }
      return;
    }
    if (this.immutableBeforeFn) {
      return;
    }
    if (!options) {
      return;
    }
    const { force, immutable } = options;
    if (force) {
      if (immutable == null || immutable) {
        this.immutableBeforeFn = true;
      }
      this.beforeFn = fn;
    }
  }

  public callAfter(fn: CallAfterFunction<T>, options?: CallFunctionOptions): void {
    if (!this.afterFn) {
      this.afterFn = fn;
      if (options?.immutable) {
        this.immutableAfterFn = true;
      }
      return;
    }
    if (this.immutableAfterFn) {
      return;
    }
    if (!options) {
      return;
    }
    const { force, immutable } = options;
    if (force) {
      if (immutable == null || immutable) {
        this.immutableAfterFn = true;
      }
      this.afterFn = fn;
    }
  }

  public reset() {
    this.chains = new Map<string, CallFunction<T, unknown>>();
    this.immutableBeforeFn = false;
    this.beforeFn = undefined;
    this.immutableAfterFn = false;
    this.afterFn = undefined;
  }

  public get isCalled(): boolean {
    return this.called;
  }

  /**
   * <h>收集调用函数列表</h>
   * <p>
   * 优先级排序规则:
   * 1. 未设置优先级的函数优先级最低
   * 2. 函数优先级越小优先
   * 3. 最长路径优先
   * </p>
   * @private
   */
  private collectionCallList(): CallItem[] {
    const callList: { path: string; priority?: number }[] = [];
    this.chains.forEach((fn, path) => {
      let { priority } = fn;
      if (typeof priority !== 'number') {
        priority = undefined;
      }
      callList.push({ path, priority });
    });
    callList.sort((a, b) => {
      const ap = a.priority;
      const bp = b.priority;
      const apn = isNil(ap);
      const bpn = isNil(bp);
      if (apn && bpn) {
        if (a.path === b.path) {
          return 0;
        }
        const apl = a.path.split('.').length;
        const bpl = b.path.split('.').length;
        if (apl === bpl) {
          return 0;
        }
        if (apl < bpl) {
          return 1;
        }
        return -1;
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
    });
    return callList;
  }

  /**
   * 并行调用
   * @param args 调用参数
   */
  public call(...args: unknown[]): Promise<T | undefined> {
    this.called = true;
    const callList = this.collectionCallList();
    return this.callBeforeFn(args).then((callBeforeResult) => {
      const callResults: ReturnPromise<T | undefined>[] = [];
      for (const callItem of callList) {
        const fn = this.chains.get(callItem.path) as CallFunction<unknown, T | undefined>;
        if (fn) {
          const callResult = fn.call(undefined, args, callBeforeResult);
          callResults.push(callResult);
        }
      }
      return this.callAfterFn(callBeforeResult, callResults, args);
    });
  }

  /**
   * 串行调用
   * @param args 调用参数
   */
  public async syncCall(...args: unknown[]): Promise<T | undefined> {
    this.called = true;
    const callList = this.collectionCallList();
    const callBeforeResult = await this.callBeforeFn(args);
    const callResults: (T | undefined)[] = [];
    for (const callItem of callList) {
      const fn = this.chains.get(callItem.path) as CallFunction<unknown, T | undefined>;
      if (fn) {
        // eslint-disable-next-line no-await-in-loop
        const callResult = await fn.call(undefined, args, callBeforeResult);
        callResults.push(callResult);
      }
    }
    return this.callAfterFn(callBeforeResult, callResults, args);
  }

  private async callBeforeFn(args: unknown[]): Promise<T | undefined> {
    let callBeforeResult: T | undefined;
    if (this.beforeFn) {
      callBeforeResult = await this.beforeFn.call(undefined, ...args);
    }
    return callBeforeResult;
  }

  private callAfterFn(
    callBeforeResult: T | undefined,
    callResults: ReturnPromise<T | undefined>[],
    args: unknown[]
  ): Promise<T | undefined> {
    return Promise.allSettled(callResults).then((results) => {
      let status = true;
      const callResultArgument: (T | undefined)[] = [];
      for (const result of results) {
        if (result.status === 'fulfilled') {
          callResultArgument.push(result.value);
        } else {
          status = false;
          if (result.reason instanceof Error) {
            console.error(result.reason);
          }
          callResultArgument.push(result.reason);
        }
      }
      if (this.afterFn) {
        return this.afterFn.call(undefined, args, callBeforeResult, {
          status,
          results: callResultArgument
        });
      }
      return callBeforeResult;
    });
  }
}
