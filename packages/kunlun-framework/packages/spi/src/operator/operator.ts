import { debugConsole, Optional, prettyConsole } from '@oinone/kunlun-shared';
import { SPIMatchAnyValue, SPIMatchKeys, SPIMatchPriorityKey, SPIOptions } from '../typing';
import { InternalOperator } from './internal-operator';
import { Storage, StorageKey } from './storage';

export interface CreateStorageOptions {
  key: StorageKey;
  matchKeys: SPIMatchKeys;
  force?: boolean;
}

/**
 * SPI 操作器
 */
export class SPIOperator {
  /**
   * 存储实例集合
   * @private
   */
  private static storageMap = new Map<string | symbol, Storage<unknown>>();

  /**
   * 创建存储实例
   * @param options 可选项
   */
  public static createStorage(options: CreateStorageOptions): boolean {
    const { key, force = false } = options;
    if (!key) {
      throw new Error('Invalid key.');
    }
    let storage = SPIOperator.storageMap.get(options.key);
    if (!storage || force) {
      storage = SPIOperator.createStorageByOptions(options);
      SPIOperator.storageMap.set(key, storage);
    }
    return true;
  }

  /**
   * 注册存储数据
   * @param store 存储 Key
   * @param options 维度值
   * @param value 存储数据
   * @param replace 是否允许替换；默认覆盖旧数据；
   */
  public static register<V = unknown>(store: StorageKey, options: SPIOptions, value: V, replace = true): boolean {
    return SPIOperator.consumerStorage(store, (storage) => storage.operator.push(options, value, replace)) || false;
  }

  /**
   * 获取与维度值匹配度最高的存储数据
   * @param store 存储 Key
   * @param options 维度值
   */
  public static selector<V = unknown>(store: StorageKey, options: SPIOptions): V | undefined {
    debugConsole.run(() => {
      const key = typeof store === 'string' ? store : store.description!;
      let mainDesc = `${options.model || ''}`;
      const keyLowerCase = key!.toLowerCase();
      if (['layouttpl'].includes(keyLowerCase)) {
        mainDesc = `${options.model}:${options.viewName}`;
      }
      if (!['field', 'action'].includes(keyLowerCase)) {
        console.group(`SPI ${key}: ${mainDesc}`);
      }
    });

    const res = SPIOperator.consumerStorage<V, V | undefined>(store, (storage) =>
      storage.operator.get({
        ...options,
        priority: Optional.ofNullable(options.priority).orElse(SPIMatchAnyValue as unknown as number)
      })
    );
    debugConsole.run(() => {
      const isResFun = res instanceof Function;
      const matchRes = !res ? '无匹配项' : isResFun ? res?.name : ' ';
      prettyConsole.info(isResFun ? 'Widget' : 'Result', matchRes);
      if (!isResFun && res) {
        console.log(res);
      }
      console.groupEnd();
    });
    return res;
  }

  /**
   * 获取与维度值相关的所有存储数据集合，并根据匹配度进行排序
   * @param store 存储 Key
   * @param options 维度值
   */
  public static selectors<V = unknown>(store: StorageKey, options: SPIOptions): V[] {
    return SPIOperator.consumerStorage<V, V[]>(store, (storage) =>
      storage.operator.getAll({
        ...options,
        priority: Optional.ofNullable(options.priority).orElse(SPIMatchAnyValue as unknown as number)
      })
    );
  }

  private static createStorageByOptions(options: CreateStorageOptions): Storage<unknown> {
    const { key, matchKeys } = options;
    return {
      key,
      operator: new InternalOperator<unknown>([...new Set([...(matchKeys || []), SPIMatchPriorityKey])])
    };
  }

  private static consumerStorage<V, R>(key: StorageKey, fn: (storage: Storage<V>) => R): R {
    const storage = SPIOperator.storageMap.get(key);
    if (!storage) {
      throw new Error('Please create storage space before registration.');
    }
    return fn(storage as Storage<V>);
  }
}
