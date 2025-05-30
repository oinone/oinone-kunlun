import { isString } from 'lodash-es';
import { CascaderItem, CascaderProperties } from './model';

export function fillCascaderItemsProperties<T = unknown>(
  options: T[] | undefined,
  properties: CascaderProperties,
  customFillProperties?: (option: CascaderItem<T>, index: number) => CascaderItem<T>
): CascaderItem<T>[] | undefined {
  if (!options) {
    return undefined;
  }
  const items: CascaderItem<T>[] = [];
  options.forEach((value, index) => {
    const option = fillCascaderItemProperties(value, index, properties, customFillProperties);
    if (option) {
      items.push(option);
    }
  });
  return items;
}

export function fillCascaderItemProperties<T = unknown>(
  value: T,
  index: number,
  properties: CascaderProperties,
  customFillProperties?: (option: CascaderItem<T>, index: number) => CascaderItem<T>
): CascaderItem<T> | undefined {
  let cascaderItem: CascaderItem<T> | undefined;
  if (isString(value)) {
    cascaderItem = {
      key: value,
      value,
      label: value,
      data: value
    };
  } else {
    cascaderItem = {
      key: value[properties.keyProp],
      value: value[properties.valueProp],
      label: value[properties.labelProp],
      disabled: value[properties.disabledProp],
      data: value,
      isLeaf: value[properties.isLeafProp],
      loaded: value[properties.loadedProp],
      loading: value[properties.loadingProp],
      children: fillCascaderItemsProperties(value[properties.childrenProp], properties, customFillProperties)
    };
  }
  if (!cascaderItem) {
    return undefined;
  }
  return customFillProperties?.(cascaderItem, index) || cascaderItem;
}
