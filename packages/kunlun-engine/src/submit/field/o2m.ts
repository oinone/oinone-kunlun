import { RuntimeO2MField } from '../../runtime-metadata';
import { ActiveRecord } from '../../typing';
import { defaultSubmit } from './default';
import { SubmitFn } from './typing';

export const O2MSubmit: SubmitFn<RuntimeO2MField, ActiveRecord[]> = (
  field,
  itemName,
  submitValue,
  value,
  defaultSubmitFn
) => {
  return (defaultSubmitFn || defaultSubmit)(field, itemName, submitValue, value);
};
