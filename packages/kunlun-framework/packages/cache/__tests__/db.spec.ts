import { OioDB } from '../src/db';
import { createOioDB } from '../src/factory';
import { getDB } from '../src/util';

describe('cache 工厂与 getDB', () => {
  it('createOioDB 返回 OioDB 实例', () => {
    const db = createOioDB();
    expect(db).toBeInstanceOf(OioDB);
  });

  it('getDB 在存在 indexedDB 且不存在 indexDB 时返回 indexedDB', () => {
    const indexedDBMock = { open: jest.fn() };
    (window as any).indexedDB = indexedDBMock;
    delete (window as any).indexDB;

    const result = getDB();
    expect(result).toBe(indexedDBMock);
  });

  it('getDB 在存在 indexDB 属性时返回 false', () => {
    (window as any).indexDB = {};
    const result = getDB();
    expect(result).toBe(false);
  });
});

describe('OioDB 连接与数据操作', () => {
  it('connectDB 在升级时创建数据表并添加索引', async () => {
    const createIndex = jest.fn();
    const createObjectStore = jest.fn(() => ({
      createIndex
    }));
    const transaction = jest.fn(() => ({
      objectStore: () => ({
        add: jest.fn(),
        get: jest.fn()
      })
    }));
    const fakeDBInstance = {
      createObjectStore,
      transaction
    };

    const open = jest.fn(() => {
      const request: any = {};
      setTimeout(() => {
        const event = { target: { result: fakeDBInstance } };
        request.onupgradeneeded && request.onupgradeneeded(event);
        request.onsuccess && request.onsuccess(event);
      }, 0);
      return request;
    });

    (window as any).indexedDB = {
      open
    };
    delete (window as any).indexDB;

    jest.useFakeTimers();
    const db = new OioDB();
    const table = {
      name: 'testTable',
      config: { keyPath: 'id' },
      columns: ['id', 'name']
    };

    const promise = db.connectDB(table as any);
    jest.runAllTimers();
    await promise;

    expect(open).toHaveBeenCalledWith('oio-db', 1);
    expect(createObjectStore).toHaveBeenCalledWith('testTable', { keyPath: 'id' });
    expect(createIndex).toHaveBeenCalledTimes(2);
    expect(createIndex).toHaveBeenNthCalledWith(1, 'id', 'id', { unique: false });
    expect(createIndex).toHaveBeenNthCalledWith(2, 'name', 'name', { unique: false });
  });

  it('insert 与 query 使用同一事务对象读写数据', async () => {
    const add = jest.fn();
    const get = jest.fn(() => {
      const request: any = {};
      setTimeout(() => {
        request.result = { id: 1, name: 'test' };
        request.onsuccess && request.onsuccess();
      }, 0);
      return request;
    });
    const objectStore = {
      add,
      get
    };
    const transaction = jest.fn(() => ({
      objectStore: () => objectStore
    }));
    const createObjectStore = jest.fn(() => ({
      createIndex: jest.fn()
    }));
    const fakeDBInstance = {
      createObjectStore,
      transaction
    };

    const open = jest.fn(() => {
      const request: any = {};
      setTimeout(() => {
        const event = { target: { result: fakeDBInstance } };
        request.onupgradeneeded && request.onupgradeneeded(event);
        request.onsuccess && request.onsuccess(event);
      }, 0);
      return request;
    });

    (window as any).indexedDB = {
      open
    };
    delete (window as any).indexDB;

    jest.useFakeTimers();
    const db = new OioDB();
    const table = {
      name: 'testTable',
      config: { keyPath: 'id' },
      columns: ['id']
    };

    const connectPromise = db.connectDB(table as any);
    jest.runAllTimers();
    await connectPromise;

    db.insert('testTable', { id: 1, name: 'test' });
    expect(transaction).toHaveBeenCalledWith(['testTable'], 'readwrite');
    expect(add).toHaveBeenCalledWith({ id: 1, name: 'test' });

    const queryPromise = db.query('testTable', 'id');
    jest.runAllTimers();
    const result = await queryPromise;

    expect(transaction).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenCalledWith('id');
    expect(result).toEqual({ id: 1, name: 'test' });
  });
});
