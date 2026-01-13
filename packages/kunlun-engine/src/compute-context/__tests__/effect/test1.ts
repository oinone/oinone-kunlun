import { EffectManager } from '../../ast';

console.log('-----------------------------------track-----------------------------------');

const runner1 = EffectManager.track(() => {
  console.log('runner1');
});

const runner2 = EffectManager.track(
  () => {
    console.log('runner2');
  },
  {
    effect: runner1.effect
  }
);

const runner3 = EffectManager.track(
  () => {
    console.log('runner3');
  },
  {
    effect: runner1.effect
  }
);

console.log('-----------------------------------trigger1-----------------------------------');

EffectManager.trigger(runner1.effect);

console.log('-----------------------------------trigger2-----------------------------------');

EffectManager.trigger(runner2.effect);

console.log('-----------------------------------trigger3-----------------------------------');

EffectManager.trigger(runner3.effect);

console.log('-----------------------------------track-----------------------------------');

const runner4 = EffectManager.track(() => {
  console.log('runner4');
});

const runner5 = EffectManager.track(
  () => {
    console.log('runner5');
  },
  {
    effect: runner4.effect,
    duplex: false
  }
);

const runner6 = EffectManager.track(
  () => {
    console.log('runner6');
  },
  {
    effect: runner4.effect,
    duplex: false
  }
);

console.log('-----------------------------------trigger4-----------------------------------');

EffectManager.trigger(runner4.effect);

console.log('-----------------------------------trigger5-----------------------------------');

EffectManager.trigger(runner5.effect);

console.log('-----------------------------------trigger6-----------------------------------');

EffectManager.trigger(runner6.effect);

console.log('-----------------------------------track-----------------------------------');

const runner7 = EffectManager.track(() => {
  console.log('runner7');
});

const runner8 = EffectManager.track(
  () => {
    console.log('runner8');
  },
  {
    effect: runner7.effect
  }
);

const runner9 = EffectManager.track(
  () => {
    console.log('runner9');
  },
  {
    effect: runner7.effect
  }
);

console.log('-----------------------------------trigger7-----------------------------------');

EffectManager.trigger(runner7.effect);

console.log('-----------------------------------trigger8-----------------------------------');

EffectManager.trigger(runner8.effect);

console.log('-----------------------------------trigger9-----------------------------------');

EffectManager.trigger(runner9.effect);

console.log('-----------------------------------stop8-----------------------------------');

runner8.effect.stop();

console.log('-----------------------------------trigger7-----------------------------------');

EffectManager.trigger(runner7.effect);

console.log('-----------------------------------trigger8-----------------------------------');

EffectManager.trigger(runner8.effect);

console.log('-----------------------------------trigger9-----------------------------------');

EffectManager.trigger(runner9.effect);
