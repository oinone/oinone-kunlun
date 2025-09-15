/**
 * 通用选择项数据结构
 */
export interface OioSelectItem<T = unknown> {
  key: string;
  value: string;
  label: string;
  data: T;

  icon?: string;
  disabled?: boolean;
}
