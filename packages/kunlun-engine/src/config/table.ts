import { RuntimeConfig, RuntimeConfigOptions } from '@oinone/kunlun-meta';
import { ConfigHelper } from './config-helper';
import { KeyboardConfig } from './keyboard';

/**
 * Table配置
 */
export interface TableConfig extends RuntimeConfigOptions {
  /**
   * 行高
   */
  lineHeight?: number | string;
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
  enableSequence?: boolean;
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
  /**
   * 快捷键配置
   */
  keyboardConfig?: TableKeyboardConfig;
}

export interface TableKeyboardConfig extends RuntimeConfigOptions {
  /**
   * 向左移动单元格
   */
  left?: KeyboardConfig;
  /**
   * 向右移动单元格
   */
  right?: KeyboardConfig;
  /**
   * 向上移动单元格
   */
  up?: KeyboardConfig;
  /**
   * 向下移动单元格
   */
  down?: KeyboardConfig;
  /**
   * 确定操作
   */
  enter?: KeyboardConfig;
  /**
   * 取消操作
   */
  cancel?: KeyboardConfig;
}

export class TableConfigManager {
  private constructor() {
    // reject create object
  }

  public static getConfig(): TableConfig {
    return ConfigHelper.getConfig<TableConfig>(RuntimeConfig.getConfig('table'));
  }
}
