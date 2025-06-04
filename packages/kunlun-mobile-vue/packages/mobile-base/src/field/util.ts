import { DslDefinition } from '@oinone/kunlun-dsl';
import {
  ActiveRecord,
  RuntimeContext,
  RuntimeEnumerationOption,
  RuntimeModel,
  RuntimeModelField
} from '@oinone/kunlun-engine';
import { ModelFieldType } from '@oinone/kunlun-meta';
import { StandardEnumerationValue, StringHelper } from '@oinone/kunlun-shared';
import { SelectItem } from '@oinone/kunlun-vue-ui-common';
import { isEmpty, isNil, toNumber, toString } from 'lodash-es';

export const enumFetchLabelByValue = (value, options: RuntimeEnumerationOption[] | undefined): string | undefined => {
  let realValue = value;
  if (value === false || value === true) {
    realValue = value.toString();
  }
  if (options && options.length > 0) {
    for (const o of options) {
      if (o.name?.toString() === realValue) {
        return o.label || o.displayName || o.name;
      }
    }
  }
  return undefined;
};

export const multiEnumFetchLabelByValue = (
  value,
  options: RuntimeEnumerationOption[] | undefined
): string | undefined => {
  const labels: string[] = [];
  for (const valueElement of value) {
    const label = enumFetchLabelByValue(valueElement, options);
    if (label != null) {
      labels.push(label);
    }
  }
  return labels.join(', ');
};

export const singleEnumFetchOptionByValue = (
  value: StandardEnumerationValue,
  options: RuntimeEnumerationOption[] | undefined
): RuntimeEnumerationOption | undefined => {
  if (value == null) {
    return undefined;
  }
  return options?.find((item) => item.name === value);
};

export const multiEnumFetchOptionByValue = (
  value: StandardEnumerationValue[] | null | undefined,
  options: RuntimeEnumerationOption[] | undefined
): RuntimeEnumerationOption[] | undefined => {
  const finalOptions = [] as any[];
  if (!value) {
    return undefined;
  }
  for (const valueElement of value) {
    const opt = singleEnumFetchOptionByValue(valueElement, options);
    if (opt) {
      finalOptions.push(opt);
    }
  }
  return finalOptions;
};

export const enumFetchOptionByValue = (
  value: StandardEnumerationValue | StandardEnumerationValue[] | null | undefined,
  options: RuntimeEnumerationOption[] | undefined
): RuntimeEnumerationOption[] | undefined => {
  if (Array.isArray(value)) {
    return multiEnumFetchOptionByValue(value, options);
  }
  const opt = singleEnumFetchOptionByValue(value, options);
  return opt ? [opt] : [];
};

export const numberAddThousandth = (num): any => {
  if (!isNil(num)) {
    return toString(num).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, '$1,');
  }
  return num;
};

export const numberZeroFill = (value: string, precision: number | null | undefined) => {
  if (isEmpty(value) || (!precision && precision !== 0)) {
    return value;
  }
  const finalValue = value as string;
  const attr = finalValue.split('.') as string[];
  if (attr.length < 2) {
    attr.push('');
  }
  const rightLength = attr[1].length;
  const left = attr[0] as string;
  let right = attr[1] as string;
  if (precision === 0) {
    if (right[0]) {
      const round = toNumber(right[0]);
      if (round >= 5) {
        return `${toNumber(left) + 1}`;
      }
    }
    return left;
  }
  const subtract = precision - rightLength;
  if (subtract < 0) {
    const realRight = right.substring(0, precision - 1);
    let roundingLeft = toNumber(right.substring(precision - 1, precision));
    const roundingRight = toNumber(right.substring(precision, precision + 1));
    if (roundingRight >= 5) {
      roundingLeft += 1;
    }
    return `${left}.${realRight}${roundingLeft}`;
  }

  for (let i = 0; i < subtract; i++) {
    right = right.concat('0');
  }

  return `${left}.${right}`;
};

export const stringIsAllNum = (str: string): boolean => {
  const regExp = new RegExp(/^[-\\+]?[0-9]*$/);
  return regExp.test(str);
};

export const toCiphertext = (str: string): string => {
  let fv = '';
  for (let i = 0; i < str.length; i++) {
    fv = fv.concat('•');
  }
  return fv;
};

export const arrSplit = (arr, size) => {
  const objArr = [] as any[];
  let index = 0;
  const objArrLen = arr.length / size;
  for (let i = 0; i < objArrLen; i++) {
    const arrTemp = [] as any[];
    for (let j = 0; j < size; j++) {
      arrTemp[j] = arr[index++];
      if (index === arr.length) {
        break;
      }
    }
    objArr[i] = arrTemp;
  }
  return objArr;
};

export enum ConstructSubmitType {
  /**
   * 主视图全部字段（设计缺陷导致此处仅能使用当前视图数据）
   */
  ALL = 'ALL',
  /**
   * 当前视图全部字段
   */
  CURRENT = 'CURRENT',
  /**
   * 自定义当前视图字段
   */
  CUSTOM = 'CUSTOM'
}

export function generatorConstructMirrorSubmitData(
  model: RuntimeModel,
  rootData: ActiveRecord,
  formData: ActiveRecord,
  submitData: ActiveRecord,
  options: {
    submitType: ConstructSubmitType;
    customSubmitFields?: string | string[];
  }
): ActiveRecord {
  const { submitType, customSubmitFields } = options;
  let queryData: ActiveRecord = submitData;
  switch (submitType) {
    case ConstructSubmitType.ALL:
      // fixme @zbh 20230408 设计缺陷导致此处仅能使用当前视图数据
      queryData = formData;
      break;
    case ConstructSubmitType.CURRENT:
      queryData = formData;
      break;
    case ConstructSubmitType.CUSTOM:
      StringHelper.convertArray(customSubmitFields)
        ?.filter((v) => !!v)
        .forEach((v) => {
          const field = model.modelFields.find((modelField) => modelField.data === v);
          if (field) {
            queryData[field.name] = formData[field.data];
          }
        });
      break;
  }
  return queryData;
}

export function clearFieldsDataFun(clearFields, data): boolean {
  let isCleaned = false;
  if (clearFields && clearFields.length) {
    for (const clearField of clearFields) {
      const val = data[clearField];
      if (val != null) {
        if (Array.isArray(val)) {
          isCleaned = true;
          data[clearField] = [];
        } else {
          isCleaned = true;
          data[clearField] = null;
        }
      }
    }
  }
  return isCleaned;
}

export function optionsConvertSelectItem(
  options: RuntimeEnumerationOption[] | undefined
): SelectItem<RuntimeEnumerationOption>[] {
  return (
    options?.map((v) => {
      return {
        key: v.name,
        value: v.name,
        label: v.label || v.displayName || v.name,
        data: v
      };
    }) || []
  );
}

export const switchRelatedWidget = (widget, ttype, relatedType) => {
  if (ttype !== ModelFieldType.Related || widget === 'Related') {
    return ttype;
  }
  return relatedType;
};

export function findRangeFields(
  runtimeContext: RuntimeContext,
  widgets: DslDefinition[]
): { startField?: RuntimeModelField; endField?: RuntimeModelField } {
  const [startFieldDslDefinition, endFieldDslDefinition] = widgets;
  let startField: RuntimeModelField | undefined;
  let endField: RuntimeModelField | undefined;
  if (startFieldDslDefinition) {
    const { data, name } = startFieldDslDefinition;
    const fieldName = data || name;
    if (fieldName) {
      startField = runtimeContext.getModelField(fieldName)?.modelField;
    }
  }
  if (endFieldDslDefinition) {
    const { data, name } = endFieldDslDefinition;
    const fieldName = data || name;
    if (fieldName) {
      endField = runtimeContext.getModelField(fieldName)?.modelField;
    }
  }
  return {
    startField,
    endField
  };
}
