/**
 * 匹配键
 */
export interface MatchKey {
  /**
   * 匹配键
   */
  key: string;
  /**
   * 权重（必须是大于等于1的整数）
   */
  weight: number;
}

/**
 * 匹配键（当值为字符串时，权重默认为1）
 */
export type MatchKeys = (string | MatchKey)[];

/**
 * 匹配键
 */
export interface InternalMatchKey extends MatchKey {
  /**
   * 加权值（根据匹配键在数组中的位置提供加权值，按从小到达排序）
   */
  weighting: number;
}
