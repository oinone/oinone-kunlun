import { EffectManager } from '../../ast';

const root = () => {
  console.log('compute hook');
};

let counter = 0;

const price = () => {
  const finalCounter = counter++;
  console.log(`compute${finalCounter} price start`);
  EffectManager.track(sum, {
    lazy: true,
    duplex: false
  });
  EffectManager.track(count, {
    lazy: true,
    duplex: false
  });
  console.log(`compute${finalCounter} price end`);
};

const count = () => {
  const finalCounter = counter++;
  console.log(`compute${finalCounter} count start`);
  EffectManager.track(sum, {
    lazy: true,
    duplex: false
  });
  EffectManager.track(price, {
    lazy: true,
    duplex: false
  });
  console.log(`compute${finalCounter} count end`);
};

const sum = () => {
  const finalCounter = counter++;
  console.log(`compute${finalCounter} sum start`);
  EffectManager.track(price, {
    lazy: true,
    duplex: false
  });
  EffectManager.track(count, {
    lazy: true,
    duplex: false
  });
  console.log(`compute${finalCounter} sum end`);
};

const rootRunner = EffectManager.track(root, {
  lazy: true,
  duplex: false
});

const priceRunner = EffectManager.track(price, {
  effect: rootRunner.effect,
  lazy: true,
  duplex: false
});

const countRunner = EffectManager.track(count, {
  effect: rootRunner.effect,
  lazy: true,
  duplex: false
});

const sumRunner = EffectManager.track(sum, {
  effect: rootRunner.effect,
  lazy: true,
  duplex: false
});

console.log('-----------------------------------trigger-----------------------------------');

EffectManager.trigger(priceRunner.effect);

console.log('-----------------------------------trigger-----------------------------------');

EffectManager.trigger(countRunner.effect);

console.log('-----------------------------------trigger-----------------------------------');

EffectManager.trigger(sumRunner.effect);
