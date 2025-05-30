import { CascaderItem } from './model';

export enum CascaderCheckedStrategy {
  SHOW_ALL = 'SHOW_ALL',
  SHOW_CHILD = 'SHOW_CHILD',
  SHOW_PARENT = 'SHOW_PARENT'
}

export type CascaderDisplayRenderFunction = (values: { labels: string[]; selectedOptions: CascaderItem[] }) => string;
