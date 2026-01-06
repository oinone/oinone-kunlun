import { RuntimeEnvironmentManager, useEnv, useGlobalEnv } from '../index';

describe('RuntimeEnvironmentManager', () => {
  const ROOT_HANDLE = '__ROOT_HANDLE__';

  afterEach(() => {
    RuntimeEnvironmentManager.select(ROOT_HANDLE);
  });

  it('getGlobalEnvironment 返回默认环境实例', () => {
    const env1 = useGlobalEnv();
    const env2 = useGlobalEnv();
    expect(env1).toBe(env2);
    expect(env1.visibleArea).toBeInstanceOf(Map);
  });

  it('createOrReplace 与 select 可以切换当前环境', () => {
    const handle = 'test-handle';
    RuntimeEnvironmentManager.createOrReplace(handle);
    RuntimeEnvironmentManager.select(handle);
    const current = useEnv();
    const stored = RuntimeEnvironmentManager.get(handle);
    expect(current).toBe(stored);
    expect(current).not.toBe(useGlobalEnv());
  });

  it('select 不存在的环境时抛出错误', () => {
    expect(() => RuntimeEnvironmentManager.select('invalid-handle')).toThrowError(/Invalid environment/);
  });

  it('delete 可以删除环境', () => {
    const handle = 'delete-handle';
    RuntimeEnvironmentManager.createOrReplace(handle);
    expect(RuntimeEnvironmentManager.get(handle)).toBeTruthy();
    RuntimeEnvironmentManager.delete(handle, true);
    expect(RuntimeEnvironmentManager.get(handle)).toBeUndefined();
  });
});
