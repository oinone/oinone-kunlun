import { isObject, isFunction } from 'lodash-es';

const isPromise = <T = any>(val: unknown): val is Promise<T> =>
  isObject(val) && isFunction((val as Promise<T>).then) && isFunction((val as Promise<T>).catch);

function noop() {}

export type Interceptor = (...args: any[]) => Promise<boolean> | boolean | undefined | void;

/**
 * 通用的拦截器，根据第一个参数返回值来决定是执行`done` 还是 `canceled`
 *
 * @example
 *
 * const beforeClose = () => true
 * const beforeClose = () => false
 * const beforeClose = async () => {
 *  const data = await fetch('xxx')
 *  return data
 * }
 *
 * callInterceptor(beforeClose, {
 *  args: [item],
 *  done() {
 *    beforeClose里面返回的 tru 会走 `done` 方法
 *  },
 *  canceled() {
 *   beforeClose里面返回的 false 会走 `canceled` 方法
 *  }
 * })
 */
export function callInterceptor(
  interceptor: Interceptor | undefined,
  {
    args = [],
    done,
    canceled
  }: {
    args?: unknown[];
    done: () => void;
    canceled?: () => void;
  }
) {
  if (interceptor) {
    // eslint-disable-next-line prefer-spread
    const returnVal = interceptor.apply(null, args);

    if (isPromise(returnVal)) {
      returnVal
        .then((value) => {
          if (value) {
            done();
          } else if (canceled) {
            canceled();
          }
        })
        .catch(noop);
    } else if (returnVal) {
      done();
    } else if (canceled) {
      canceled();
    }
  } else {
    done();
  }
}
