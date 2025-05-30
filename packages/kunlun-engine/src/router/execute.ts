import { RuntimeAction } from '../runtime-metadata';
import { getBackRouter, getForwardRouter } from './factory';

export interface ForwardOptions {
  action: RuntimeAction;
}

export function back(options?: ForwardOptions) {
  const { router, force } = getBackRouter();
  if (force) {
    router.back();
    return;
  }
  router.back();
}

export function forward(options?: ForwardOptions) {
  const { router, force } = getForwardRouter();
  if (force) {
    router.forward();
    return;
  }
  router.forward();
}
