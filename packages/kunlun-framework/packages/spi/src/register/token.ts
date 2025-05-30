import { SPIFactory } from '../operator';
import { StorageKey } from '../operator/storage';
import { SPIMatchKeys } from '../typing';

export const Base = (
  tokenType: StorageKey,
  keys: SPIMatchKeys = [],
  property?: { tokenPropertyKey?: string; selectorPropertyKey?: string }
) => {
  return <T extends Object>(target: T) => {
    if (typeof tokenType === 'string') {
      tokenType = Symbol(tokenType);
    }
    return SPIFactory.Storage(keys, {
      key: tokenType,
      tokenPropertyKey: property?.tokenPropertyKey,
      selectorPropertyKey: property?.selectorPropertyKey
    })(target);
  };
};
