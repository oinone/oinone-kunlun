import { ReturnPromise, ReturnVoid } from './typing';

type InterruptibleExecuteFunction<T> = (target: T) => ReturnPromise<boolean | ReturnVoid>;

function isNotInterrupted(res: boolean | ReturnVoid): boolean {
  return res !== false;
}

/**
 * 串行执行
 * @param list 待执行对象列表
 * @param execute 可中断执行函数; 返回false将中断执行
 */
export function serialExecutor<T>(list: T[], execute: InterruptibleExecuteFunction<T>) {
  $serialExecutor(list, 0, execute);
}

function $serialExecutor<T>(list: T[], index: number, execute: InterruptibleExecuteFunction<T>) {
  const target = list[index];
  if (!target) {
    return;
  }
  const res = execute(target);
  if (res instanceof Promise) {
    res.then((v) => {
      if (isNotInterrupted(v)) {
        $serialExecutor(list, index + 1, execute);
      }
    });
  } else if (isNotInterrupted(res)) {
    $serialExecutor(list, index + 1, execute);
  }
}

/**
 * 串行执行 (阻塞/强有序)
 * @param list 待执行对象列表
 * @param execute 可中断执行函数; 返回false将中断执行
 * @return 是否被中断
 */
export function blockingSerialExecutor<T>(list: T[], execute: InterruptibleExecuteFunction<T>): Promise<boolean> {
  return $blockingSerialExecutor(list, 0, execute);
}

async function $blockingSerialExecutor<T>(
  list: T[],
  index: number,
  execute: InterruptibleExecuteFunction<T>
): Promise<boolean> {
  const target = list[index];
  if (!target) {
    return true;
  }
  const res = execute(target);
  if (res instanceof Promise) {
    return res.then((v) => {
      if (isNotInterrupted(v)) {
        return $blockingSerialExecutor(list, index + 1, execute);
      }
      return false;
    });
  }
  if (isNotInterrupted(res)) {
    return $blockingSerialExecutor(list, index + 1, execute);
  }
  return false;
}
