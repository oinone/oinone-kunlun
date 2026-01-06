import { instantiate } from '../src/constructor';

class SampleClass {
  public value: number;

  public constructor(value: number) {
    this.value = value;
  }
}

class RealClass {
  public value: number;

  public constructor(value: number) {
    this.value = value;
  }
}

function ProxyConstructor(this: any, value: number) {
  return value;
}

(ProxyConstructor as any).__proxy_constructor__ = RealClass;

describe('instantiate', () => {
  it('传入对象时直接返回该对象', () => {
    const obj = { a: 1 };
    const result = instantiate(obj);
    expect(result).toBe(obj);
  });

  it('传入 class 构造函数时会创建新实例', () => {
    const result = instantiate<SampleClass>(SampleClass, 10);
    expect(result).toBeInstanceOf(SampleClass);
    expect(result.value).toBe(10);
  });

  it('__proxy_constructor__ 指向真实构造函数时使用代理构造', () => {
    const result = instantiate<RealClass>(ProxyConstructor as any, 20);
    expect(result).toBeInstanceOf(RealClass);
    expect(result.value).toBe(20);
  });

  it('无效构造函数时抛出错误', () => {
    expect(() => instantiate(undefined as any)).toThrow('Invalid constructor');
  });
});
