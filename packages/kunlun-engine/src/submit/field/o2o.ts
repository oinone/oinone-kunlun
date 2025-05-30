import { RuntimeO2OField } from '../../runtime-metadata';
import { ActiveRecord } from '../../typing';
import { defaultSubmit } from './default';
import { SubmitFn } from './typing';

export const O2OSubmit: SubmitFn<RuntimeO2OField, ActiveRecord> = (
  field,
  itemName,
  submitValue,
  value,
  defaultSubmitFn
) => {
  return (defaultSubmitFn || defaultSubmit)(field, itemName, submitValue, value);
};
