import { StateStream } from '../src/store/state-stream';

describe('StateStream', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initValue 与 getContext 保持同步', () => {
    const stream = new StateStream<{ a: number; b?: number }>({ a: 1 });
    expect(stream.getContext()).toEqual({ a: 1 });
    stream.initValue({ a: 2, b: 3 });
    expect(stream.getContext()).toEqual({ a: 2, b: 3 });
  });

  it('setValue 与 setValues 会更新上下文', () => {
    const stream = new StateStream<{ a: number; b?: number }>({ a: 1 });
    stream.setValue('a', 5);
    expect(stream.getValueByKey('a')).toBe(5);
    stream.setValues({ b: 10 });
    expect(stream.getContext()).toEqual({ a: 5, b: 10 });
    expect(stream.getValues(['a', 'b'])).toEqual([5, 10]);
  });

  it('pluck 只在值变化时触发，pluckSome 每次更新都触发', () => {
    const stream = new StateStream<{ a: number; b: number }>({ a: 1, b: 2 });
    const aValues: number[] = [];
    const someValues: Array<[number, number]> = [];

    stream.pluck('a').subscribe((v) => aValues.push(v));
    stream.pluckSome(['a', 'b']).subscribe((v) => someValues.push(v as [number, number]));

    stream.setValue('a', 1);
    stream.setValue('a', 3);
    stream.setValues({ a: 3, b: 4 });

    jest.runAllTimers();

    expect(aValues).toEqual([1, 3]);
    expect(someValues).toEqual([
      [1, 2],
      [1, 2],
      [3, 2],
      [3, 4]
    ]);
  });

  it('subscribe 使用 debounceTime 合并快速更新', () => {
    const stream = new StateStream<{ a: number }>({ a: 1 });
    const values: Array<{ a: number }> = [];
    stream.subscribe((v) => values.push(v));

    stream.setValue('a', 2);
    stream.setValue('a', 3);

    jest.runAllTimers();

    expect(values[0]).toEqual({ a: 3 });
    expect(values[values.length - 1]).toEqual({ a: 3 });
  });
});
