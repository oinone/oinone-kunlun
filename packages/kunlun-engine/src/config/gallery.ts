import { RuntimeConfigOptions } from '@oinone/kunlun-meta';
import { ConfigHelper } from './config-helper';

export interface GalleryConfig extends RuntimeConfigOptions {
  /**
   * 排序
   */
  sortable?: boolean;
  /**
   * 切换行高
   */
  switchLineHeight?: boolean;
  /**
   * 全屏
   */
  enabledFullScreen?: boolean;
  /**
   * 切换列数
   */
  switchCols: boolean;
}

export class GalleryConfigManager {
  private constructor() {
    // reject create object
  }

  public static getConfig(): GalleryConfig {
    return ConfigHelper.getConfig<GalleryConfig>('galleryConfig');
  }
}
