import { EnumOptionState } from '@oinone/kunlun-meta';

export interface SelectItem<T = unknown> {
  key: string;
  value: string;
  label: string;
  state?: EnumOptionState;
  disabled?: boolean;
  icon?: string;
  data: T;
}

export interface SelectProperties {
  valueProp: string;
  keyProp: string;
  labelProp: string;
  disabledProp: string;
  iconProp?: string;
  filterProp: string;
}

export const defaultSelectProperties: SelectProperties = {
  valueProp: 'value',
  keyProp: 'key',
  labelProp: 'label',
  disabledProp: 'disabled',
  iconProp: 'icon',
  filterProp: 'label'
};

export interface PaginationOptions {
  currentPage: number;
  size: number;
  total: number;
}

export const defaultPaginationOptions = {
  currentPage: 1,
  size: 20,
  total: -1
} as PaginationOptions;

export interface PaginationResult<T> {
  total: number;
  options: T[];
}

export interface LoadOptionsContext {
  currentPage: number;
  size: number;
  total: number;
  searchValue: string;
}
