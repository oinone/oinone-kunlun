import { ConfigHelper, EnabledConfig } from '@kunlun/engine';
import { RuntimeConfig, RuntimeConfigOptions } from '@kunlun/meta';

/**
 * 合作伙伴切换配置
 */
export interface PartnerSwitcherConfig extends RuntimeConfigOptions, EnabledConfig {
  /**
   * 是否启用
   */
  enabled?: boolean;
}

export class PartnerSwitcherConfigManager {
  private constructor() {
    // reject create object
  }

  public static getConfig(): PartnerSwitcherConfig {
    return ConfigHelper.getConfig(RuntimeConfig.getConfig('partnerSwitcher'));
  }

  public static isEnabled(): boolean {
    let { enabled } = PartnerSwitcherConfigManager.getConfig();
    if (enabled == null) {
      enabled = false;
    }
    return enabled;
  }
}
