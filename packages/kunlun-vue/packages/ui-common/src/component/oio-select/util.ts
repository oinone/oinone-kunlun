import { Converter } from '@kunlun/shared';
import { isString } from 'lodash-es';
import { SelectItem, SelectProperties } from './model';


export function fillSelectItemProperties<T = unknown>(
  value: T,
  index: number,
  properties: SelectProperties,
  customFillProperties?: (option: SelectItem<T>, index: number) => SelectItem<T>
): SelectItem<T> | undefined {
  let selectItem: SelectItem<T> | undefined;
  if (isString(value)) {
    selectItem = {
      key: value,
      value,
      label: value,
      data: value
    };
  } else {
    selectItem = {
      key: value[properties.keyProp],
      value: value[properties.valueProp],
      label: value[properties.labelProp],
      disabled: value[properties.disabledProp],
      data: value
    };
  }
  if (!selectItem) {
    return undefined;
  }
  return customFillProperties?.(selectItem, index) || selectItem;
}

export const appendSelectOptions = <T = unknown>(
  options: SelectItem<T>[],
  selected: SelectItem<T> | undefined,
  firstLoadOption: SelectItem<T> | undefined,
  properties: SelectProperties,
  customFillProperties: Converter<SelectItem<T>, SelectItem<T>> | undefined,
  list: T[],
  isInit: boolean
): SelectItem<T>[] => {
  const firstLoadOptionFilterValue = firstLoadOption ? firstLoadOption.data[properties.filterProp] : undefined;
  let filterValue: string | undefined;
  if (isInit) {
    options = [];
    if (selected) {
      filterValue = selected.data[properties.filterProp];
    }
  }
  list.forEach((value, index) => {
    const targetFilterValue = value[properties.filterProp];
    if (
      (filterValue && filterValue === targetFilterValue) ||
      (firstLoadOptionFilterValue && firstLoadOptionFilterValue === targetFilterValue)
    ) {
      return;
    }
    const option = fillSelectItemProperties(value, index, properties, customFillProperties);
    if (option) {
      options.push(option);
    }
  });
  return options;
};
