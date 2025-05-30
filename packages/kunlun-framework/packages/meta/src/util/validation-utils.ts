import { isEmptyKeObject } from './ke-common';

const isValidateEmpty = (value: any): boolean => {
  return isEmptyKeObject(value) || (Array.isArray(value) && value.length === 0);
};

const isEmptyValue = (value: any): value is null => {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
};

export { isValidateEmpty, isEmptyValue };
