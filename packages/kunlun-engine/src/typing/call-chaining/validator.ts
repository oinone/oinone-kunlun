import { BooleanHelper } from '@kunlun/shared';
import { isBoolean, isNil } from 'lodash-es';

export interface ValidatorCallChainingParameters {
  notify: boolean;
  sendErrorMessage?: boolean;
}

export function getValidatorParameters(args: unknown[] | undefined): ValidatorCallChainingParameters {
  const validatorParameter = args?.[0] as boolean | ValidatorCallChainingParameters | undefined;
  let notify = true;
  if (!isNil(validatorParameter)) {
    if (isBoolean(validatorParameter)) {
      notify = BooleanHelper.toBoolean(validatorParameter) || false;
    } else {
      return validatorParameter;
    }
  }
  return {
    notify
  };
}
