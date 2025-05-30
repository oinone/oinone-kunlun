import {
  isArray,
  isBoolean,
  isEmpty,
  isEqual,
  isNaN,
  isNil,
  isNumber,
  isObject,
  isString,
  snakeCase,
  toNumber,
  toUpper
} from 'lodash-es';
import { Nullable } from './typing';
import { uniqueKeyGenerator } from './UniqueKeyGenerator';

/**
 * <h2>对象基类</h2>
 * <p>提供{@link JObject#hashCode}和{@link JObject#equals}基础方法</p>
 */
export class JObject {
  private readonly _hashCode: string;

  public constructor() {
    this._hashCode = uniqueKeyGenerator(15);
  }

  public equals(o: unknown) {
    if (this === o) {
      return true;
    }
    if (!(o instanceof JObject)) {
      return false;
    }
    return this.hashCode === o.hashCode;
  }

  public get hashCode() {
    return this._hashCode;
  }
}

export class ObjectUtils {
  public static isEmpty(value: unknown): boolean {
    if (isNil(value)) {
      return true;
    }
    if (isNumber(value)) {
      return isNaN(toNumber(value));
    }
    if (isBoolean(value)) {
      return false;
    }
    return isEmpty(value);
  }

  public static isNotEmpty(value: unknown): boolean {
    return !ObjectUtils.isEmpty(value);
  }

  public static isNull<T>(value: Nullable<T>): value is null | undefined {
    return value == null;
  }

  public static isNotNull<T>(value: T): value is NonNullable<T> {
    return value != null;
  }

  public static equals(a: unknown, b: unknown): boolean {
    if (a == null || b == null) {
      return false;
    }
    return isEqual(a, b);
  }

  public static congruent(a: unknown, b: unknown): boolean {
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
    }
    return a === b;
  }

  public static safeSetter(obj: object | undefined, target: object | undefined, key: string, targetKey?: string) {
    const finalTargetKey = targetKey || key;
    if (!obj || !target || key in obj || !(finalTargetKey in target)) {
      return;
    }
    obj[key] = target[finalTargetKey];
  }

  /**
   * 浅合并
   * @param origin 原值
   * @param target 合并到原值的对象
   * @return 是否发生合并变更
   */
  public static shallowMerge(origin: object, target: object): boolean {
    let isChange = false;
    Object.entries(target).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }
      if (origin[key] !== value) {
        isChange = true;
        origin[key] = value;
      }
    });
    return isChange;
  }

  /**
   * 深合并
   * @param origin
   * @param target
   */
  public static deepMerge(origin: object, target: object): object {
    Object.entries(target).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }
      const originValue = origin[key];
      if (isArray(value)) {
        let originCollection: unknown[] | undefined;
        if (originValue == null) {
          originCollection = [];
        } else if (isArray(originValue)) {
          originCollection = originValue;
        } else {
          console.warn(
            `deep merge error. type is not same. originType=${typeof originValue}, targetType=${typeof value}`
          );
          return;
        }
        origin[key] = originCollection?.concat(value);
      } else if (isObject(value)) {
        let originObject: Object | undefined;
        if (originValue == null) {
          originObject = {};
          origin[key] = originObject;
        } else if (isObject(originValue)) {
          originObject = originValue;
        } else {
          console.warn(
            `deep merge error. type is not same. originType=${typeof originValue}, targetType=${typeof value}`
          );
          return;
        }
        ObjectUtils.deepMerge(originObject, value);
      } else {
        origin[key] = value;
      }
    });
    return origin;
  }

  public static isRepeat<T>(repeatSet: Set<T>, value: T): boolean {
    const oldSize = repeatSet.size;
    repeatSet.add(value);
    return repeatSet.size === oldSize;
  }

  public static isNotRepeat<T>(repeatSet: Set<T>, value: T): boolean {
    return !ObjectUtils.isRepeat(repeatSet, value);
  }

  public static readonly<T extends object>(object: T, readonlyKeys?: string[]): T {
    return new Proxy(object, {
      get(target, p: string | symbol, receiver: unknown): unknown {
        return Reflect.get(target, p, receiver);
      },
      set(target, p: string | symbol, value: unknown, receiver: unknown): boolean {
        if (isString(p) && (!readonlyKeys || readonlyKeys.includes(p))) {
          console.log('readonly attribute not setter.', p);
          return false;
        }
        return Reflect.set(target, p, value, receiver);
      }
    });
  }

  public static toUpperSnakeCase<T>(object: Record<string, T>): Record<string, T> {
    if (!object) {
      return {};
    }
    return Object.entries(object).reduce((obj, next) => {
      const [key, value] = next;
      return {
        ...obj,
        [toUpper(snakeCase(key))]: value
      };
    }, {});
  }

  public static translate(data: any) {
    Object.entries(data).forEach(([key, val]) => {
      if (isString(val) && val.startsWith('$t(') && val.endsWith(')')) {
        data[key] = val.substring(3, val.length - 1);
        // data[key] = window.translate(val.substring(3, val.length - 1));
        return;
      }
      if (Array.isArray(val)) {
        val.forEach((a) => ObjectUtils.translate(a));
        return;
      }
      if (isObject(val) && Object.keys(val)) {
        ObjectUtils.translate(val);
      }
    });
  }

  public static translateList(dataList: any[]) {
    dataList?.forEach((a) => ObjectUtils.translate(a));
  }
}
