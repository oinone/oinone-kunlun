import { Optional } from '@kunlun/shared';
import { isString } from 'lodash-es';
import { TreeSelectNode, TreeSelectProperties } from './model';

export function fillTreeSelectNodesProperties<T = unknown>(
  options: T[] | undefined,
  properties: TreeSelectProperties,
  customFillProperties?: (option: TreeSelectNode<T>, index: number) => TreeSelectNode<T>
): TreeSelectNode<T>[] | undefined {
  if (!options) {
    return undefined;
  }
  const items: TreeSelectNode<T>[] = [];
  options.forEach((value, index) => {
    const option = fillTreeSelectNodeProperties(value, index, properties, customFillProperties);
    if (option) {
      items.push(option);
    }
  });
  return items;
}

export function fillTreeSelectNodeProperties<T = unknown>(
  value: T,
  index: number,
  properties: TreeSelectProperties,
  customFillProperties?: (option: TreeSelectNode<T>, index: number) => TreeSelectNode<T>
): TreeSelectNode<T> | undefined {
  let treeSelectNode: TreeSelectNode<T> | undefined;
  if (isString(value)) {
    treeSelectNode = {
      key: value,
      value,
      label: value,
      data: value
    };
  } else {
    treeSelectNode = {
      key: value[properties.keyProp],
      value: value[properties.valueProp],
      label: value[properties.labelProp],
      disabled: value[properties.disabledProp],
      data: value,
      isLeaf: value[properties.isLeafProp],
      loaded: value[properties.loadedProp],
      loading: value[properties.loadingProp],
      disableCheckbox: Optional.ofNullable(value[properties.checkboxProp])
        .map((v) => !v)
        .orElse(false),
      selectable: value[properties.selectableProp],
      children: fillTreeSelectNodesProperties(value[properties.childrenProp], properties, customFillProperties)
    };
  }
  if (!treeSelectNode) {
    return undefined;
  }
  return customFillProperties?.(treeSelectNode, index) || treeSelectNode;
}
