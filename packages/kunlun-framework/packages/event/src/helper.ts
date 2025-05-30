const isType = <T>(type: string | string[]) => (obj: unknown): obj is T => getType(obj) === `[object ${type}]`;
const getType = (obj: any) => Object.prototype.toString.call(obj);
const isFn = (val: any): val is Function => typeof val === 'function';
const isArr = Array.isArray;
const isPlainObj = isType<object>('Object');
const isStr = isType<string>('String');
const isBool = isType<boolean>('Boolean');
const isNum = isType<number>('Number');
const isMap = (val: any): val is Map<any, any> => val && val instanceof Map;
const isSet = (val: any): val is Set<any> => val && val instanceof Set;
const isWeakMap = (val: any): val is WeakMap<any, any> => val && val instanceof WeakMap;
const isWeakSet = (val: any): val is WeakSet<any> => val && val instanceof WeakSet;
const isNumberLike = (index: any): index is number => isNum(index) || /^\d+$/.test(index);
const isObj = (val: unknown): val is object => typeof val === 'object';
const isRegExp = isType<RegExp>('RegExp');

export {
  isFn,
  isArr,
  isPlainObj,
  isStr,
  isBool,
  isNum,
  isMap,
  isSet,
  isWeakMap,
  isWeakSet,
  isNumberLike,
  isObj,
  isRegExp
};
