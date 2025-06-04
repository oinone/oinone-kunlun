import { Converter } from '@oinone/kunlun-shared';

export interface InitializationBody<K, V> {
  key: K;
  value: V;
  isProcess: boolean;
  isNull?: boolean;
}

const NULL_BODY = { isProcess: true, isNull: true } as InitializationBody<unknown, unknown>;

export interface SearchCache<K, V> {
  keyGenerator(value: V): K;

  get(key: K): V | undefined;
}

export abstract class AbstractSearchCache<K, V, T> implements SearchCache<K, V> {
  protected origin: T;

  protected cache: Map<K, InitializationBody<K, V>>;

  protected keyGetter: Converter<V, K>;

  protected constructor(origin: T, keyGetter: Converter<V, K>) {
    this.origin = origin;
    this.cache = new Map<K, InitializationBody<K, V>>();
    this.keyGetter = keyGetter;
  }

  protected abstract next(): V | undefined;

  public keyGenerator(value: V): K {
    return this.keyGetter(value);
  }

  public get(key: K): V | undefined {
    return this.searchBody(key).value;
  }

  protected searchBody(
    key: K,
    ifAbsentFunction: (key: K) => InitializationBody<K, V> = () => NULL_BODY as InitializationBody<K, V>
  ): InitializationBody<K, V> {
    let body = this.cache.get(key);
    if (body == null) {
      let value = this.next();
      while (value != null) {
        body = this.getInitializationBodyByValue(value);
        const { key: newBodyKey } = body;
        this.cache.set(newBodyKey, body);
        if (newBodyKey === key) {
          return body;
        }
        value = this.next();
      }
      body = ifAbsentFunction?.(key);
      if (body.isNull) {
        this.cache.set(key, body);
      } else {
        this.cache.set(body.key, body);
      }
    }
    return body;
  }

  protected getInitializationBody(key: K, value: V): InitializationBody<K, V> {
    return {
      key,
      value,
      isProcess: false
    };
  }

  protected getInitializationBodyByValue(value: V): InitializationBody<K, V> {
    return this.getInitializationBody(this.keyGenerator(value), value);
  }
}

export class MemoryListSearchCache<K, V> extends AbstractSearchCache<K, V, V[]> implements SearchCache<K, V> {
  private index: number;

  public constructor(origin: V[], keyGetter: Converter<V, K>) {
    super(origin, keyGetter);
    this.index = -1;
  }

  protected next(): V | undefined {
    this.index++;
    const { origin, index } = this;
    if (index < origin.length) {
      return origin[index];
    }
    return undefined;
  }
}
