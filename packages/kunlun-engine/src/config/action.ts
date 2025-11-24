import { RuntimeConfig, RuntimeConfigOptions } from '@oinone/kunlun-meta';
import { ConfigHelper } from './config-helper';

/**
 * Action配置
 */
export interface ActionConfig extends RuntimeConfigOptions {
  /**
   * 显示默认图标
   */
  showDefaultIcon?: boolean;
}

export class ActionConfigManager {
  private constructor() {
    // reject create object
  }

  public static getConfig(): ActionConfig {
    return ConfigHelper.getConfig<ActionConfig>(RuntimeConfig.getConfig('action'));
  }
}
