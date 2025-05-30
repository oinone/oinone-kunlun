import { translateValueByKey } from '@kunlun/engine';
import { isPlainObject } from 'lodash-es';

/**
 * 用来字面量写法的数组或者对象
 *
 * @param  {T} value 数组对象 或者 普通对象
 * @param  {string|string[]} key? 对象中的key，如果不传递，那么会将对象所有的value进行翻译
 */
export function definePropertyTranslate<T extends Record<string, unknown> | any[]>(value: T, key?: string | string[]) {
  const defineProperty = (item: Record<string, any>, propertyKey: string) => {
    const val = item[propertyKey];
    Object.defineProperty(item, propertyKey, {
      get() {
        return translateValueByKey(val);
      }
    });
  };

  const translate = (item: Record<string, unknown>) => {
    if (!key) {
      Object.keys(item).forEach((k) => defineProperty(item, k));
      return;
    }

    if (Array.isArray(key)) {
      key.forEach((k) => defineProperty(item, k));
    } else {
      defineProperty(item, key);
    }
  };

  if (Array.isArray(value)) {
    value.filter(isPlainObject).forEach(translate);
  } else if (isPlainObject(value)) {
    translate(value);
  }
}
