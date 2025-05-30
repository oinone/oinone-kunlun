type ReturnPromise<T> = T | Promise<T>;

/**
 * key/value缓存
 */
export interface Cache<K, V> {
  /**
   * 从缓存中获取，当值从未获取过时，将自动调用{@link Cache#fetchValue}进行获取
   * @param key 键
   * @return 值
   */
  get(key: K): ReturnPromise<V | undefined>;

  /**
   * 从缓存中获取，当值从未获取过时，将自动调用{@link Cache#fetchValue}进行获取
   * @param key 键
   * @return 值
   * @throws request error
   */
  getOrThrow(key: K): ReturnPromise<V | undefined>;

  /**
   * 根据键获取值
   * @param key 键
   * @return 值
   */
  fetchValue(key: K): ReturnPromise<V | undefined>;

  /**
   * 清理缓存
   * @param key 键，当指定key时，将清理对应缓存；当key为undefined时，将清理全部缓存
   */
  clear(key?: K);
}

/**
 * 基础缓存抽象基类
 */
abstract class AbstractBaseCache<K = string, V = unknown> implements Cache<K, V> {
  public abstract get(key: K): ReturnPromise<V | undefined>;

  public abstract getOrThrow(key: K): ReturnPromise<V | undefined>;

  public abstract fetchValue(key: K): ReturnPromise<V | undefined>;

  public clear(key?: K) {
    if (key == null) {
      this.clearAll();
    } else {
      const finalKey = this.cacheKeyFormat(this.keyGenerator(key));
      this.clearCache(finalKey);
    }
  }

  protected abstract clearCache(key: string);

  protected abstract clearAll();

  protected keyGenerator(key: K): string {
    if (typeof key === 'string') {
      return key;
    }
    return `${JSON.stringify(key)}`;
  }

  protected cacheKeyFormat(key: string): string {
    return `pamirs_cache_${key}`;
  }
}

/**
 * 缓存基类
 * @param key
 */
export abstract class AbstractCache<K = string, V = unknown> extends AbstractBaseCache<K, V> implements Cache<K, V> {
  protected abstract getCache(key: string): V | null | undefined;

  protected abstract setCache(key: string, value: V): void;

  protected abstract setNullCache(key: string): void;

  public get(key: K): V | undefined {
    const finalKey = this.cacheKeyFormat(this.keyGenerator(key));
    let value = this.getCache(finalKey);
    if (value === null) {
      return undefined;
    }
    if (value === undefined) {
      value = this.fetchValueAndSetter(finalKey, key);
    }
    return value;
  }

  public abstract fetchValue(key: K): V | undefined;

  protected fetchValueAndSetter(finalKey: string, originKey: K): V | undefined {
    let value: V | null | undefined;
    try {
      value = this.fetchValue(originKey);
    } catch (e) {
      console.error(e);
      value = null;
    }
    value = this.unsafeSetCache(finalKey, value);
    return value;
  }

  public getOrThrow(key: K): V | undefined {
    const finalKey = this.cacheKeyFormat(this.keyGenerator(key));
    let value = this.getCache(finalKey);
    if (value === null) {
      return undefined;
    }
    if (value === undefined) {
      value = this.fetchValueAndSetterOrThrow(finalKey, key);
    }
    return value;
  }

  protected fetchValueAndSetterOrThrow(finalKey: string, originKey: K): V | undefined {
    let value: V | null | undefined = this.fetchValue(originKey);
    value = this.unsafeSetCache(finalKey, value);
    return value;
  }

  protected unsafeSetCache(finalKey: string, value: V | null | undefined): V | undefined {
    if (value == null) {
      this.setNullCache(finalKey);
      value = undefined;
    } else {
      this.setCache(finalKey, value);
    }
    return value;
  }
}

/**
 * 异步缓存基类
 * @param key
 */
export abstract class AbstractAsyncCache<K = string, V = unknown>
  extends AbstractBaseCache<K, V>
  implements Cache<K, V>
{
  protected abstract getCache(key: string): Promise<V | null | undefined>;

  protected abstract setCache(key: string, value: ReturnPromise<V | null | undefined>): void;

  protected abstract setNullCache(key: string): void;

  public async get(key: K): Promise<V | undefined> {
    const finalKey = this.cacheKeyFormat(this.keyGenerator(key));
    let value: V | null | undefined;
    try {
      value = await this.getCache(finalKey);
    } catch (ignored) {
      value = null;
    }
    if (value === null) {
      return undefined;
    }
    if (value === undefined) {
      value = await this.fetchValueAndSetter(finalKey, key);
    }
    return value;
  }

  public abstract fetchValue(key: K): Promise<V | undefined>;

  protected async fetchValueAndSetter(finalKey: string, originKey: K): Promise<V | undefined> {
    const value = this.$$fetchValueAndSetter(finalKey, originKey);
    this.setCache(finalKey, value);
    return value.then((v) => {
      if (v === null) {
        return undefined;
      }
      return v;
    });
  }

  public async getOrThrow(key: K): Promise<V | undefined> {
    const finalKey = this.cacheKeyFormat(this.keyGenerator(key));
    let value = await this.getCache(finalKey);
    if (value === null) {
      return undefined;
    }
    if (value === undefined) {
      value = await this.fetchValueAndSetterOrThrow(finalKey, key);
    }
    return value;
  }

  protected async fetchValueAndSetterOrThrow(finalKey: string, originKey: K): Promise<V | undefined> {
    const value = this.fetchValue(originKey);
    this.setCache(finalKey, value);
    return value;
  }

  protected async $$fetchValueAndSetter(finalKey: string, originKey: K): Promise<V | null | undefined> {
    let value: V | null | undefined;
    try {
      value = await this.fetchValue(originKey);
    } catch (e) {
      console.error(e);
      value = null;
    }
    return value;
  }

  protected async unsafeSetCache(finalKey: string, value: ReturnPromise<V | null | undefined>): Promise<V | undefined> {
    let finalValue = await value;
    if (finalValue == null) {
      this.setNullCache(finalKey);
      finalValue = undefined;
    } else {
      await this.setCache(finalKey, finalValue);
    }
    return finalValue;
  }
}

/**
 * 内存缓存
 */
export abstract class MemoryCache<K = string, V = unknown> extends AbstractCache<K, V> implements Cache<K, V> {
  protected cache = new Map<string, V | null>();

  protected getCache(key: string): V | null | undefined {
    return this.cache.get(key);
  }

  protected setCache(key: string, value: V) {
    return this.cache.set(key, value);
  }

  protected setNullCache(key: string) {
    return this.cache.set(key, null);
  }

  protected clearCache(key: string) {
    this.cache.delete(key);
  }

  protected clearAll() {
    this.cache.clear();
  }
}

/**
 * 内存异步缓存
 */
export abstract class MemoryAsyncCache<K = string, V = unknown>
  extends AbstractAsyncCache<K, V>
  implements Cache<K, V>
{
  protected cache = new Map<string, ReturnPromise<V | null | undefined>>();

  protected async getCache(key: string): Promise<V | null | undefined> {
    return this.cache.get(key);
  }

  protected setCache(key: string, value: Promise<V | null | undefined>) {
    this.cache.set(key, value);
  }

  protected setNullCache(key: string) {
    return this.cache.set(key, null);
  }

  protected clearCache(key: string) {
    this.cache.delete(key);
  }

  protected clearAll() {
    this.cache.clear();
  }
}

/**
 * 本地存储缓存
 */
export abstract class LocalStorageCache extends AbstractCache<string, string> implements Cache<string, string> {
  public static NULL_STRING = '___null___';

  protected getCache(key: string): string | null | undefined {
    const value = localStorage.getItem(key);
    if (value === LocalStorageCache.NULL_STRING) {
      return null;
    }
    return value;
  }

  protected setCache(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  protected setNullCache(key: string) {
    localStorage.setItem(key, LocalStorageCache.NULL_STRING);
  }

  protected clearCache(key: string) {
    localStorage.removeItem(key);
  }

  protected clearAll() {
    localStorage.clear();
  }
}

/**
 * 不可用
 */
// abstract class LocalStorageAsyncCache extends AbstractAsyncCache<string, string> implements Cache<string, string> {
//   protected async getCache(key: string): Promise<string | null | undefined> {
//     const value = localStorage.getItem(key);
//     if (value === LocalStorageCache.NULL_STRING) {
//       return null;
//     }
//     return value;
//   }
//
//   protected async setCache(key: string, value: Promise<string | undefined>) {
//     const finalValue = await value;
//     if (finalValue === undefined) {
//       return;
//     }
//     localStorage.setItem(key, finalValue);
//   }
//
//   protected setNullCache(key: string) {
//     localStorage.setItem(key, LocalStorageCache.NULL_STRING);
//   }
//
//   protected clearCache(key: string) {
//     localStorage.removeItem(key);
//   }
//
//   protected clearAll() {
//     localStorage.clear();
//   }
// }
