import { BooleanHelper } from '@kunlun/shared';
import { RuntimeModelField } from '../../runtime-metadata';
import { defaultSubmit } from './default';
import { SubmitFn } from './typing';

export const booleanSubmit: SubmitFn<RuntimeModelField, string | boolean> = (field, itemName, submitValue, value) => {
  return defaultSubmit(field, itemName, submitValue, BooleanHelper.toBoolean(value));
};
