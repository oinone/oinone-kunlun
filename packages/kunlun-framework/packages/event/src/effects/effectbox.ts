import { isStr, isFn } from '../helper';
import { LifeCycle, LifeCycleHeart } from '../lifecycle';
import { RegistryType, LifeCycleTypes } from '../typing';

function creatEffectHook<V, C>(lifeType: LifeCycleTypes, registryType: RegistryType) {
  return (type: string, callback?: (ctx: C) => void) => {
    if (!isStr(type)) {
      throw new Error(`arg[0] must be string, but now is ${typeof type}`);
    }

    if (callback) {
      if (isFn(callback)) {
        LifeCycleHeart.setType(registryType);
        LifeCycleHeart.setLifeCycle(lifeType, type, new LifeCycle<C>(callback));
      } else {
        throw new Error(`arg[1] must be function`);
      }
    }
  };
}

export { creatEffectHook };
