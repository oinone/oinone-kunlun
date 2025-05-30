import { isString } from 'lodash-es';
import { StandardString } from './typing';

const __IGNORE_VALUE__ = Symbol('JSON.stringify_ignored');

export class JSONUtils {
  public static toJSONString(
    value: unknown,
    filter?: (key: string, value: unknown) => boolean,
    map?: (key: string, value: unknown) => unknown
  ) {
    if (!filter && !map) {
      return JSON.stringify(value);
    }
    if (isString(value)) {
      return JSON.stringify(value);
    }
    return JSON.stringify(value, (key, val) => {
      if (filter && filter(key, val)) {
        return __IGNORE_VALUE__;
      }
      if (map) {
        return map(key, val);
      }
      return val;
    });
  }

  public static parseObject<T>(text: string): T {
    return JSON.parse(text);
  }

  public static isEmpty(text: StandardString): boolean {
    return !text || text === '{}';
  }
}
