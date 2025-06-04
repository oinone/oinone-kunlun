import { ConfigHelper, EnabledConfig } from '@oinone/kunlun-engine';
import { RuntimeConfig, RuntimeConfigOptions } from '@oinone/kunlun-meta';

/**
 * 调试配置
 */
export interface DebugConfig extends RuntimeConfigOptions, EnabledConfig {
  /**
   * 是否启用
   */
  enabled?: boolean;
}

export class DebugConfigManager {
  private constructor() {
    // reject create object
  }

  public static getConfig(): DebugConfig {
    return ConfigHelper.getConfig(RuntimeConfig.getConfig('debug'));
  }

  public static isEnabled(): boolean {
    let { enabled } = DebugConfigManager.getConfig();
    if (enabled == null) {
      enabled = true;
    }
    return enabled;
  }
}
