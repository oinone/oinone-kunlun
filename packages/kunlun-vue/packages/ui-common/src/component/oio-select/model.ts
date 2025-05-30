import { EnumOptionState } from '@kunlun/meta';

export interface SelectItem<T = unknown> {
  key: string;
  value: string;
  label: string;
  state?: EnumOptionState;
  disabled?: boolean;
  data: T;
}

export interface SelectProperties {
  valueProp: string;
  keyProp: string;
  labelProp: string;
  disabledProp: string;
  filterProp: string;
}

export const defaultSelectProperties: SelectProperties = {
  valueProp: 'value',
  keyProp: 'key',
  labelProp: 'label',
  disabledProp: 'disabled',
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
