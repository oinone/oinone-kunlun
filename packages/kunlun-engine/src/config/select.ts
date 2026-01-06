import { RuntimeConfig, type RuntimeConfigOptions } from '@oinone/kunlun-meta';
import { ConfigHelper } from './config-helper';
import type { TableConfig } from './table';

export enum SelectSearchArea {
  default = 'default',
  dropdown = 'dropdown'
}

export interface SelectRuntimeConfig extends RuntimeConfigOptions {
  searchArea?: SelectSearchArea;
}

export class SelectConfigManager {
  private constructor() {
    // reject create object
  }

  public static getConfig(): TableConfig {
    return ConfigHelper.getConfig<SelectRuntimeConfig>(RuntimeConfig.getConfig('select'));
  }
}
