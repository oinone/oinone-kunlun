import { BehaviorSubject, filter, map, of } from '../index';

describe('state operators', () => {
  it('of 与 map 可以组合使用', (done) => {
    const result: number[] = [];
    of(1, 2, 3)
      .pipe(
        map((v) => v * 2),
        filter((v) => v > 2)
      )
      .subscribe({
        next: (v) => result.push(v),
        complete: () => {
          expect(result).toEqual([4, 6]);
          done();
        }
      });
  });

  it('BehaviorSubject 可与 map 组合监听状态', (done) => {
    const subject = new BehaviorSubject({ count: 0 });
    const received: number[] = [];

    subject
      .pipe(
        map((s) => s.count),
        filter((c) => c >= 1)
      )
      .subscribe({
        next: (v) => received.push(v),
        complete: () => {
          expect(received).toEqual([1, 2]);
          done();
        }
      });

    subject.next({ count: 1 });
    subject.next({ count: 2 });
    subject.complete();
  });
});
