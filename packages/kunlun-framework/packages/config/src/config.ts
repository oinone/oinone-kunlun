import { instantiate } from '@oinone/kunlun-shared';
import { ConfigProviderSPI, ConfigProviderOptions, ConfigProviderService } from './helper/ConfigProviderSPI';

/**
 * 从对象中尝试多个键获取值，支持链式访问(如 'a.b.c')
 * @param obj 源对象
 * @param keys 键别名数组，按优先级顺序尝试
 * @returns 找到的第一个值或null
 */
export const tryGetValueByKeys = (service: ConfigProviderService, keys: string[]): any => {
  if (!service || !keys.length) {
    return null;
  }

  for (const key of keys) {
    let current = service.getConfig?.(key);

    if (current != null) {
      return current;
    }
  }

  return null;
};

export interface IGetMergeConfig extends ConfigProviderOptions {
  defaultValue: any;
  otherConfigs?: any[];
}

/**
 * @param key 配置键别名，支持多个别名按优先级尝试
 * @param options 配置选项
 */
export const getMergeConfig = (key: string | string[], options: IGetMergeConfig) => {
  const { defaultValue, otherConfigs = [], ...restOption } = options;
  const keys = Array.isArray(key) ? key : [key];

  const configProviderServices = ConfigProviderSPI.Selector(restOption).map(instantiate);

  const values: any[] = [];

  configProviderServices.forEach((service) => {
    const configValue = tryGetValueByKeys(service, keys);
    if (configValue !== null) {
      values.push(configValue);
    }
  });

  otherConfigs.length &&
    otherConfigs.forEach((configObj) => {
      if (typeof configObj !== 'object' || configObj === null) {
        return;
      }
      const configValue = tryGetValueByKeys(configObj || {}, keys);
      if (configValue !== null) {
        values.push(configValue);
      }
    });

  return new Proxy(
    {},
    {
      get(target, prop) {
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          if (value && typeof value === 'object' && prop in value) {
            return value[prop];
          }
        }

        if (defaultValue && typeof defaultValue === 'object' && prop in defaultValue) {
          return defaultValue[prop];
        }

        return undefined;
      }
    }
  );
};
