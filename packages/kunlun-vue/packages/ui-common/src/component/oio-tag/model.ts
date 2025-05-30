import { defaultSelectProperties, SelectItem, SelectProperties } from '../oio-select';

export interface TagsItem<T = unknown> extends Omit<SelectItem<T>, 'state'> {
  color?: string;
  backgroundColor?: string;
  icon?: string;
  checked?: boolean;
  closable?: boolean;
}

export interface TagsProperties extends SelectProperties {
  colorProp: string;
  backgroundColorProp: string;
  iconProp: string;
  checkedProp: string;
  closableProp: string;
}

export const defaultTagsProperties: TagsProperties = {
  ...defaultSelectProperties,
  colorProp: 'color',
  backgroundColorProp: 'backgroundColor',
  iconProp: 'icon',
  checkedProp: 'checked',
  closableProp: 'closable'
};
