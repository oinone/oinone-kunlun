import {
  isArr,
  isBool,
  isFn,
  isMap,
  isNum,
  isNumberLike,
  isObj,
  isPlainObj,
  isRegExp,
  isSet,
  isStr,
  isWeakMap,
  isWeakSet
} from '../index';

describe('event helper 类型判断', () => {
  it('isFn 判断函数', () => {
    expect(isFn(() => 0)).toBe(true);
    expect(isFn(1 as any)).toBe(false);
  });

  it('isArr 判断数组', () => {
    expect(isArr([])).toBe(true);
    expect(isArr({} as any)).toBe(false);
  });

  it('isPlainObj 判断普通对象', () => {
    expect(isPlainObj({})).toBe(true);
    expect(isPlainObj([] as any)).toBe(false);
  });

  it('isStr 判断字符串', () => {
    expect(isStr('a')).toBe(true);
    expect(isStr(1 as any)).toBe(false);
  });

  it('isBool 判断布尔值', () => {
    expect(isBool(true)).toBe(true);
    expect(isBool(false)).toBe(true);
    expect(isBool(0 as any)).toBe(false);
  });

  it('isNum 判断数字', () => {
    expect(isNum(1)).toBe(true);
    expect(isNum('1' as any)).toBe(false);
  });

  it('isMap 与 isSet 判断 Map 和 Set', () => {
    expect(isMap(new Map())).toBe(true);
    expect(isMap({} as any)).toBe(false);
    expect(isSet(new Set())).toBe(true);
    expect(isSet([] as any)).toBe(false);
  });

  it('isWeakMap 与 isWeakSet 判断 WeakMap 和 WeakSet', () => {
    expect(isWeakMap(new WeakMap())).toBe(true);
    expect(isWeakSet(new WeakSet())).toBe(true);
  });

  it('isNumberLike 判断数字或数字字符串', () => {
    expect(isNumberLike(1)).toBe(true);
    expect(isNumberLike('10')).toBe(true);
    expect(isNumberLike('a')).toBe(false);
  });

  it('isObj 判断对象', () => {
    expect(isObj({})).toBe(true);
    expect(isObj(null)).toBe(true);
  });

  it('isRegExp 判断正则表达式', () => {
    expect(isRegExp(/a/)).toBe(true);
    expect(isRegExp('a' as any)).toBe(false);
  });
});
