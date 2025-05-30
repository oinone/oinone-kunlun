import { RuntimeConfig, RuntimeConfigOptions } from '@kunlun/meta';
import { ConfigHelper, EnabledConfig } from '../../config';

/**
 * 面包屑配置
 */
export interface BreadcrumbConfig extends RuntimeConfigOptions, EnabledConfig {
  /**
   * <h3>是否启用</h3>
   * <p>启用时，需配合mask渲染对应的面包屑组件</p>
   * <p>默认: 开启</p>
   */
  enabled?: boolean;
  /**
   * <h3>首页配置</h3>
   * <p>boolean值与{@link BreadcrumbHomepageConfig#enabled}等效</p>
   */
  homepage?: boolean | BreadcrumbHomepageConfig;
}

/**
 * 首页配置
 */
export interface BreadcrumbHomepageConfig extends RuntimeConfigOptions, EnabledConfig {
  /**
   * <h3>首项显示首页</h3>
   * <p>默认: 开启</p>
   */
  enabled?: boolean;
  /**
   * <h3>首页类型</h3>
   * <p>默认: 'application'</p>
   */
  type?: 'application' | 'module';
}

export class BreadcrumbConfigManager {
  private constructor() {
    // reject create object
  }

  public static getConfig(): BreadcrumbConfig {
    return ConfigHelper.getConfig(RuntimeConfig.getConfig<BreadcrumbConfig>('breadcrumb'));
  }

  public static isEnabled(): boolean {
    return ConfigHelper.getBoolean(BreadcrumbConfigManager.getConfig().enabled, true);
  }

  public static getHomepageConfig(): BreadcrumbHomepageConfig {
    return ConfigHelper.getConfig(BreadcrumbConfigManager.getConfig().homepage);
  }
}
