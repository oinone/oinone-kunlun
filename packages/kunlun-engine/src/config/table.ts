import { RuntimeConfigOptions } from '@oinone/kunlun-meta';
import { ConfigHelper } from './config-helper';

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

  /**
   * 排序
   */
  sortable?: boolean;
  /**
   * 分组
   */
  enableGrouping?: boolean;
  /**
   * 切换行高
   */
  switchLineHeight?: boolean;
  /**
   * 全屏
   */
  enabledFullScreen?: boolean;
  /**
   * 快捷键
   */
  enabledKeyboard?: boolean;
}

export class TableConfigManager {
  private constructor() {
    // reject create object
  }

  public static getConfig(): TableConfig {
    return ConfigHelper.getConfig<TableConfig>('tableConfig');
  }
}
