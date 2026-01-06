import { BooleanHelper } from '@oinone/kunlun-shared';
import type { RuntimeModelField } from '../../runtime-metadata';
import { defaultSubmit } from './default';
import type { SubmitFn } from './typing';

export const booleanSubmit: SubmitFn<RuntimeModelField, string | boolean> = (field, itemName, submitValue, value) => {
  return defaultSubmit(field, itemName, submitValue, BooleanHelper.toBoolean(value));
};
