import { EffectManager } from '../../ast';

const f1 = () => {
  console.log('runner1');
};

const f2 = () => {
  console.log('runner2');
};

const f3 = () => {
  console.log('runner3');
};

const runner1 = EffectManager.track(f1, {
  duplex: false
});

const runner2 = EffectManager.track(f2, {
  effect: runner1.effect,
  duplex: false
});

const runner3 = EffectManager.track(f3, {
  effect: runner2.effect,
  duplex: false
});

const runner4 = EffectManager.track(f2, {
  effect: runner3.effect,
  duplex: false
});

const runner5 = EffectManager.track(f2, {
  effect: runner3.effect,
  duplex: false
});

console.log('-----------------------------------trigger-----------------------------------');

EffectManager.trigger(runner1.effect);

console.log('-----------------------------------trigger-----------------------------------');

EffectManager.trigger(runner2.effect);

console.log('-----------------------------------trigger-----------------------------------');

EffectManager.trigger(runner3.effect);
