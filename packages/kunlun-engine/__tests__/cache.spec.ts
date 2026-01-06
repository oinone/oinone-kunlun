import type { Converter } from '@oinone/kunlun-shared';
import {
  AbstractAsyncCache,
  AbstractCache,
  LocalStorageCache,
  MemoryAsyncCache,
  MemoryCache,
  type Cache,
  MemoryListSearchCache
} from '../src/cache';
import { ClearCache } from '../src/cache/CacheClear';
import { toRecord } from '../src/cache/helper';

class TestMemoryCache extends MemoryCache<string, number> implements Cache<string, number> {
  public fetchValue(key: string): number | undefined {
    if (key === 'a') {
      return 1;
    }
    if (key === 'b') {
      throw new Error('fetch error');
    }
    return undefined;
  }
}

class TestMemoryAsyncCache extends MemoryAsyncCache<string, number> implements Cache<string, number> {
  public async fetchValue(key: string): Promise<number | undefined> {
    if (key === 'a') {
      return 1;
    }
    if (key === 'b') {
      throw new Error('fetch error');
    }
    return undefined;
  }
}

class TestLocalStorageCache extends LocalStorageCache {
  public fetchValue(key: string): string | undefined {
    if (key === 'a') {
      return '1';
    }
    return undefined;
  }
}

class TestAbstractCache extends AbstractCache<string, number> implements Cache<string, number> {
  private store = new Map<string, number | null>();

  protected getCache(key: string): number | null | undefined {
    return this.store.get(key);
  }

  protected setCache(key: string, value: number): void {
    this.store.set(key, value);
  }

  protected setNullCache(key: string): void {
    this.store.set(key, null);
  }

  public fetchValue(key: string): number | undefined {
    if (key === 'a') {
      return 1;
    }
    if (key === 'b') {
      throw new Error('fetch error');
    }
    return undefined;
  }

  protected clearCache(key: string): void {
    this.store.delete(key);
  }

  protected clearAll(): void {
    this.store.clear();
  }
}

class TestAbstractAsyncCache extends AbstractAsyncCache<string, number> implements Cache<string, number> {
  private store = new Map<string, Promise<number | null | undefined> | null>();

  protected async getCache(key: string): Promise<number | null | undefined> {
    const value = this.store.get(key);
    if (value == null) {
      return value as number | null | undefined;
    }
    return value;
  }

  protected setCache(key: string, value: Promise<number | null | undefined>): void {
    this.store.set(key, value);
  }

  protected setNullCache(key: string): void {
    this.store.set(key, null);
  }

  public async fetchValue(key: string): Promise<number | undefined> {
    if (key === 'a') {
      return 1;
    }
    if (key === 'b') {
      throw new Error('fetch error');
    }
    return undefined;
  }

  protected clearCache(key: string): void {
    this.store.delete(key);
  }

  protected clearAll(): void {
    this.store.clear();
  }
}

describe('cache base classes', () => {
  it('AbstractCache get caches value and converts null to undefined', () => {
    const cache = new TestAbstractCache();
    const value1 = cache.get('a');
    expect(value1).toBe(1);
    const value2 = cache.get('b');
    expect(value2).toBeUndefined();
  });

  it('AbstractCache getOrThrow throws fetch error and does not set null cache', () => {
    const cache = new TestAbstractCache();
    expect(() => cache.getOrThrow('b')).toThrow('fetch error');
  });

  it('AbstractAsyncCache get caches value and converts null to undefined', async () => {
    const cache = new TestAbstractAsyncCache();
    const value1 = await cache.get('a');
    expect(value1).toBe(1);
    const value2 = await cache.get('b');
    expect(value2).toBeUndefined();
  });

  it('AbstractAsyncCache getOrThrow throws fetch error and does not set null cache', async () => {
    const cache = new TestAbstractAsyncCache();
    const value1 = await cache.getOrThrow('a');
    expect(value1).toBe(1);
  });

  it('MemoryCache uses Map as backend storage', () => {
    const cache = new TestMemoryCache();
    const value1 = cache.get('a');
    expect(value1).toBe(1);
    const value2 = cache.get('b');
    expect(value2).toBeUndefined();
  });

  it('MemoryAsyncCache uses Map as async backend storage', async () => {
    const cache = new TestMemoryAsyncCache();
    const value1 = await cache.get('a');
    expect(value1).toBe(1);
    const value2 = await cache.get('b');
    expect(value2).toBeUndefined();
  });
});

describe('LocalStorageCache', () => {
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    const store: Record<string, string> = {};
    // @ts-expect-error jest environment mock
    global.localStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((key) => delete store[key]);
      }
    };
  });

  afterEach(() => {
    // @ts-expect-error reset mock
    global.localStorage = originalLocalStorage;
  });

  it('LocalStorageCache get/set behaviour and null marker', () => {
    const cache = new TestLocalStorageCache();
    const value1 = cache.get('a');
    expect(value1).toBeUndefined();
    const value2 = cache.get('b');
    expect(value2).toBeUndefined();
    cache.clear();
  });
});

describe('ClearCache', () => {
  it('register and clear should call registered functions', () => {
    const called: string[] = [];
    const fn1 = () => called.push('fn1');
    const fn2 = () => called.push('fn2');
    ClearCache.register(fn1);
    ClearCache.register(fn2);
    ClearCache.clear();
    expect(called).toEqual(['fn1', 'fn2']);
  });
});

describe('SearchCache', () => {
  it('MemoryListSearchCache should search and cache by key', () => {
    const list = [
      {
        id: 1,
        name: 'a'
      },
      {
        id: 2,
        name: 'b'
      }
    ];
    const keyGetter: Converter<{ id: number; name: string }, number> = (item) => item.id;
    const cache = new MemoryListSearchCache<number, { id: number; name: string }>(list, keyGetter);
    const hit = cache.get(2);
    expect(hit).toEqual({ id: 2, name: 'b' });
    const miss = cache.get(3);
    expect(miss).toBeUndefined();
  });
});

describe('toRecord', () => {
  it('converts JSON-like strings to objects', () => {
    const input = {
      a: '{"x":1}',
      b: ' not json ',
      c: 1
    } as Record<string, unknown>;
    const result = toRecord(input);
    expect(result.a).toEqual({ x: 1 });
    expect(result.b).toBe(' not json ');
    expect(result.c).toBe(1);
  });

  it('returns empty object when input is undefined', () => {
    const result = toRecord(undefined);
    expect(result).toEqual({});
  });
});
