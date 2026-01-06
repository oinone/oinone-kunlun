import type { OioSelectItem } from './select';

/**
 * 通用列表项数据结构
 */
export interface OioListItem<T = unknown> extends OioSelectItem<T> {
  key: string;
  value: string;
  label: string;
  data: T;

  icon?: string;
  /**
   * 是否被选中
   */
  checked?: boolean;
  /**
   * 是否禁用
   */
  disabled?: boolean;
}
