import { ConfigHelper } from '@oinone/kunlun-engine';
import { RuntimeConfigOptions } from '@oinone/kunlun-meta';

/**
 * Table配置
 */
export interface TableConfig extends RuntimeConfigOptions {
  /**
   * 行高
   */
  lineHeight?: number;
  /**
   * 最小行高
   */
  minLineHeight?: number;
  /**
   * 自动行高
   */
  autoLineHeight?: boolean;
}

export class TableConfigManager {
  private constructor() {
    // reject create object
  }

  public static getConfig(): TableConfig {
    return ConfigHelper.getConfig<TableConfig>('tableConfig');
  }
}
