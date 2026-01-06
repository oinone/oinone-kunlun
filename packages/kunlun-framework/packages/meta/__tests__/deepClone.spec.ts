import { deepClone } from '../index';

describe('deepClone', () => {
  it('返回对象的深拷贝', () => {
    const source = { a: 1, b: { c: 2 } };
    const cloned = deepClone(source) as typeof source;
    expect(cloned).toEqual(source);
    expect(cloned).not.toBe(source);
    expect(cloned.b).not.toBe(source.b);
  });

  it('null 与 undefined 原样返回', () => {
    expect(deepClone(null)).toBeNull();
    expect(deepClone(undefined)).toBeUndefined();
  });
});
