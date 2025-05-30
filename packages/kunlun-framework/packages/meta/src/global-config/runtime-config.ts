import { PluginLoadDependencies } from '../plugin-loader';

const RUNTIME_CONFIG_RESOLVE = 'runtimeConfigResolve';

const runtimeConfigCache: {
  init: boolean;
  updateTime: Date;
  value: Record<string, unknown>;
} = {
  init: false,
  updateTime: new Date(),
  value: {}
};

export interface RuntimeConfigOptions {
  [key: string]: string | string[] | boolean | number | number[] | undefined | RuntimeConfigOptions;
}

/**
 * .env文件配置项
 * RUNTIME_CONFIG_BASE_URL 运行时配置文件URL 默认: 当前路径
 * RUNTIME_CONFIG_FILENAME 运行时配置文件名称 默认: manifest
 */
export class RuntimeConfig {
  public static async init(dependencies?: PluginLoadDependencies): Promise<void> {
    if (!runtimeConfigCache.init) {
      return init();
    }
  }

  public static get(): Record<string, unknown> {
    if (!runtimeConfigCache.init) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('runtime config is not init.');
      }
      return {};
    }
    return runtimeConfigCache.value || {};
  }

  public static getConfig<T extends RuntimeConfigOptions = RuntimeConfigOptions>(key: string): T | undefined {
    return RuntimeConfig.get()[key] as T;
  }
}

function errorProcess(resolve) {
  return () => {
    resolve({});
    Reflect.deleteProperty(window, RUNTIME_CONFIG_RESOLVE);
  };
}

function loadRuntimeConfig() {
  return new Promise<Record<string, unknown>>((resolve) => {
    Reflect.set(window, RUNTIME_CONFIG_RESOLVE, (value: Record<string, string>) => {
      resolve(value);
      Reflect.deleteProperty(window, RUNTIME_CONFIG_RESOLVE);
    });
    const script = document.createElement('script');
    script.src = `${process.env.RUNTIME_CONFIG_BASE_URL || ''}/${process.env.RUNTIME_CONFIG_FILENAME || 'manifest'}.js`;
    const ep = errorProcess(resolve);
    script.onload = ep;
    script.onerror = ep;
    document.body.appendChild(script);
  });
}

function init() {
  if (runtimeConfigCache.init) {
    return;
  }
  if (Reflect.get(window, RUNTIME_CONFIG_RESOLVE)) {
    return;
  }
  return loadRuntimeConfig()
    .then(async (value) => {
      runtimeConfigCache.updateTime = new Date();
      runtimeConfigCache.value = value;
    })
    .finally(() => {
      runtimeConfigCache.init = true;
    });
}
