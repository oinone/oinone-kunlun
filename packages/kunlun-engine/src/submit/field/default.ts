import { ObjectUtils } from '@oinone/kunlun-shared';
import { isArray, isObject } from 'lodash-es';
import { isRelatedField } from '../../runtime-context';
import { SubmitType } from '../typing';
import { relatedSubmit } from './related';
import { SubmitFn } from './typing';

export const defaultSubmit: SubmitFn = (field, itemName, submitValue, value) => {
  if (value === undefined) {
    return undefined;
  }
  if (field.submitType === SubmitType.none) {
    return undefined;
  }
  const submitResult = submitValue.records;
  if (!submitResult || isArray(submitResult)) {
    return undefined;
  }
  const result: Record<string, unknown> = {};
  const currentSubmitResult = submitResult[itemName];
  if (currentSubmitResult === undefined) {
    result[itemName] = value;
  } else if (isObject(currentSubmitResult) && isObject(value)) {
    ObjectUtils.shallowMerge(currentSubmitResult, value);
    result[itemName] = currentSubmitResult;
  }
  if (isRelatedField(field)) {
    const relatedResult = relatedSubmit(field, itemName, submitValue, value);
    if (relatedResult) {
      Object.keys(relatedResult).forEach((key) => {
        result[key] = relatedResult[key];
      });
    }
  }
  return result;
};
