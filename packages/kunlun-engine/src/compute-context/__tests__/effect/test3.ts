import { EffectManager } from '../../ast';

console.log('-----------------------------------track-----------------------------------');

const f2 = () => {
  console.log('runner2');
};

const f3 = () => {
  console.log('runner3');
};

const runner1 = EffectManager.track(() => {
  console.log('runner1');
  EffectManager.track(f2, { lazy: true });
  EffectManager.track(f3, { lazy: true });
});

console.log('-----------------------------------trigger-----------------------------------');

EffectManager.trigger(runner1.effect);

console.log('-----------------------------------trigger-----------------------------------');

EffectManager.trigger(runner1.effect);

console.log('-----------------------------------trigger-----------------------------------');

EffectManager.trigger(runner1.effect);
