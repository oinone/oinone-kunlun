import { RuntimeConfigOptions } from '@oinone/kunlun-meta';

/**
 * 实验性配置
 */
export interface ExperimentalConfig extends RuntimeConfigOptions {
  /**
   * buildQueryCondition方法版本；目前仅有next和非next两个版本；
   */
  buildQueryCondition?: string;
}
