import { isString } from 'lodash-es';
import { TagsItem, TagsProperties } from './model';

export function fillTagsItemProperties<T = unknown>(
  value: T,
  index: number,
  properties: TagsProperties,
  customFillProperties?: (option: TagsItem<T>, index: number) => TagsItem<T>
): TagsItem<T> | undefined {
  let tagsItem: TagsItem<T> | undefined;
  if (isString(value)) {
    tagsItem = {
      key: value,
      value,
      label: value,
      data: value
    };
  } else {
    tagsItem = {
      key: value[properties.keyProp],
      value: value[properties.valueProp],
      label: value[properties.labelProp],
      disabled: value[properties.disabledProp],
      data: value,
      color: value[properties.colorProp],
      backgroundColor: value[properties.backgroundColorProp],
      icon: value[properties.iconProp],
      checked: value[properties.checkedProp],
      closable: value[properties.closableProp]
    };
  }
  if (!tagsItem) {
    return undefined;
  }
  return customFillProperties?.(tagsItem, index) || tagsItem;
}
