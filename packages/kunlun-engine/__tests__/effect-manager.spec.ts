import { EffectManager } from '../src/compute-context/ast';

describe('EffectManager', () => {
  it('track creates runner and trigger executes scheduler', () => {
    const calls: string[] = [];
    const runner = EffectManager.track(() => {
      calls.push('root');
    });
    expect(calls).toEqual(['root']);
    calls.length = 0;
    EffectManager.trigger(runner.effect);
    expect(calls).toEqual(['root']);
  });

  it('lazy option delays initial execution until trigger', () => {
    const calls: string[] = [];
    const runner = EffectManager.track(
      () => {
        calls.push('lazy');
      },
      {
        lazy: true
      }
    );
    expect(calls).toEqual([]);
    EffectManager.trigger(runner.effect);
    expect(calls).toEqual(['lazy']);
  });

  it('nested track reuses dependencies and stop prevents further triggers', () => {
    const calls: string[] = [];
    const child = () => {
      calls.push('child');
    };
    const runner = EffectManager.track(() => {
      calls.push('root');
      EffectManager.track(child);
    });
    expect(calls).toEqual(['root', 'child']);
    calls.length = 0;
    EffectManager.trigger(runner.effect);
    expect(calls).toEqual(['root', 'child']);
    calls.length = 0;
    runner.effect.stop();
    EffectManager.trigger(runner.effect);
    expect(calls).toEqual([]);
  });
});
