import BigNumber from 'bignumber.js';
import { isNil } from 'lodash-es';

/**
 * @see https://mikemcl.github.io/bignumber.js
 */
BigNumber.config({ EXPONENTIAL_AT: 1e9 });

export function fetchRealValue(
  val: string | number | undefined,
  safeInteger: string | number
): { value: BigNumber; isSafeInteger: boolean } | undefined {
  let num: BigNumber | undefined;
  let isSafeInteger = false;
  if (isNil(val)) {
    isSafeInteger = true;
    num = new BigNumber(safeInteger);
  } else {
    num = new BigNumber(val);
  }
  if (num.isNaN()) {
    return undefined;
  }
  return {
    value: num,
    isSafeInteger
  };
}

export { BigNumber };
