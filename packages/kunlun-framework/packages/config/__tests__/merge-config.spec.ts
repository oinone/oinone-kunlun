import { ConfigProviderSPI, type ConfigProviderService, getMergeConfig } from '../index';

class TestConfigProvider implements ConfigProviderService {
  private config: Record<string, any>;

  public constructor() {
    this.config = {
      primary: { foo: 1, bar: 2 },
      alias: { foo: 3 }
    };
  }

  public getConfig<T = any>(key: string): T | null | undefined {
    return this.config[key] as T;
  }
}

describe('getMergeConfig', () => {
  it('优先从 ConfigProviderSPI 提供的服务中按别名顺序读取', () => {
    const service = new TestConfigProvider();
    ConfigProviderSPI.register({ name: 'merge-test' }, service);

    const merged: any = getMergeConfig(['alias', 'primary'], {
      name: 'merge-test',
      defaultValue: { foo: 0, baz: 9 } as any
    });

    expect(merged.foo).toBe(3);
    expect(merged.bar).toBeUndefined();
    expect(merged.baz).toBe(9);
  });

  it('当未找到任何配置时使用 defaultValue 兜底', () => {
    const merged: any = getMergeConfig('unknown', {
      name: 'merge-test-not-exist',
      defaultValue: { foo: 5 } as any
    });

    expect(merged.foo).toBe(5);
    expect(merged.bar).toBeUndefined();
  });
});
