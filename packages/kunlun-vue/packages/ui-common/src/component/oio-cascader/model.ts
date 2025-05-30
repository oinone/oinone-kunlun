import { defaultSelectProperties, SelectItem, SelectProperties } from '../oio-select';

export interface CascaderItem<T = unknown> extends Omit<SelectItem<T>, 'state'> {
  children?: CascaderItem[];
  isLeaf?: boolean;
  loaded?: boolean;
  loading?: boolean;
}

export interface CascaderProperties extends SelectProperties {
  childrenProp: string;
  isLeafProp: string;
  loadedProp: string;
  loadingProp: string;
}

export const defaultCascaderProperties: CascaderProperties = {
  ...defaultSelectProperties,
  childrenProp: 'children',
  isLeafProp: 'isLeaf',
  loadedProp: 'loaded',
  loadingProp: 'loading'
};
