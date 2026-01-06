import { type ConfigProviderService, tryGetValueByKeys } from '../index';

describe('tryGetValueByKeys', () => {
  it('按顺序返回第一个非空配置值', () => {
    const service: ConfigProviderService = {
      getConfig: ((key: string) => {
        if (key === 'a') {
          return null;
        }
        if (key === 'b') {
          return 'value';
        }
        return undefined;
      }) as any
    };
    expect(tryGetValueByKeys(service, ['a', 'b', 'c'])).toBe('value');
  });

  it('找不到配置时返回 null', () => {
    const service: ConfigProviderService = {
      getConfig: (() => undefined) as any
    };
    expect(tryGetValueByKeys(service, ['x', 'y'])).toBeNull();
  });

  it('service 或 keys 为空时返回 null', () => {
    const service: ConfigProviderService = {
      getConfig: (() => 'value') as any
    };
    expect(tryGetValueByKeys(undefined as unknown as ConfigProviderService, ['a'])).toBeNull();
    expect(tryGetValueByKeys(service, [])).toBeNull();
  });
});
