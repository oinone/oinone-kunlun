import { RuntimeConfig, RuntimeConfigOptions } from '@oinone/kunlun-meta';
import { ConfigHelper } from './config-helper';

export interface CollapseConfig extends RuntimeConfigOptions {
  type: string;
}

export class CollapseConfigManager {
  private constructor() {
    // reject create object
  }

  public static getConfig(): CollapseConfig {
    return ConfigHelper.getConfig<CollapseConfig>(RuntimeConfig.getConfig('collapse'));
  }
}
