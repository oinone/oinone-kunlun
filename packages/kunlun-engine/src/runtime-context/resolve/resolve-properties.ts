import { DslDefinition, DslDefinitionType } from '@kunlun/dsl';
import { BooleanHelper } from '@kunlun/shared';
import { isObjectLike } from 'lodash-es';
import { RuntimeContext } from '../runtime-context';

const IGNORED_KEYS = ['widgets'];

export function resolveProperties(runtimeContext: RuntimeContext, dsl: DslDefinition) {
  Object.entries(dsl).forEach(([key, value]) => {
    if (IGNORED_KEYS.includes(key)) {
      return;
    }
    if (key === 'dslNodeType' && value === 'xslot') {
      dsl[key] = DslDefinitionType.SLOT;
    }
    safeResolveValue(dsl, key, value);
  });
}

function safeResolveValue(obj: object, key: string, value: unknown) {
  if (typeof value === 'string') {
    if (value === 'null') {
      obj[key] = null;
    } else if (value === 'undefined') {
      obj[key] = undefined;
    } else {
      safeSetter(obj, key, BooleanHelper.toBoolean(value));
    }
  } else {
    traversalResolveValue(value);
  }
}

function traversalResolveValue(val: unknown) {
  if (Array.isArray(val)) {
    for (let i = 0; i < val.length; i++) {
      const arrayValue = val[i];
      if (typeof arrayValue === 'string') {
        safeSetterArray(val, i, BooleanHelper.toBoolean(arrayValue));
      } else {
        traversalResolveValue(arrayValue);
      }
    }
  } else if (isObjectLike(val)) {
    const obj = val as object;
    Object.entries(obj).forEach(([key, value]) => {
      safeResolveValue(obj, key, value);
    });
  }
}

function safeSetter(obj: object, key: string, value: unknown): boolean {
  if (value != null) {
    obj[key] = value;
    return true;
  }
  return false;
}

function safeSetterArray(array: unknown[], index: number, value: unknown) {
  if (value != null) {
    array[index] = value;
  }
}
