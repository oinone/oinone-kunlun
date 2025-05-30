import { defaultSelectProperties, SelectItem, SelectProperties } from '../oio-select';

export interface TreeSelectNode<T = unknown> extends Omit<SelectItem<T>, 'state'> {
  children?: TreeSelectNode[];
  isLeaf?: boolean;
  loaded?: boolean;
  loading?: boolean;
  disableCheckbox?: boolean;
  selectable?: boolean;
}

export interface TreeSelectProperties extends SelectProperties {
  childrenProp: string;
  isLeafProp: string;
  loadedProp: string;
  loadingProp: string;
  checkboxProp: string;
  selectableProp: string;
}

export const defaultTreeSelectProperties: TreeSelectProperties = {
  ...defaultSelectProperties,
  childrenProp: 'children',
  isLeafProp: 'isLeaf',
  loadedProp: 'loaded',
  loadingProp: 'loading',
  checkboxProp: 'checkbox',
  selectableProp: 'selectable'
};
