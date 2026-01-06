import { selectorCurrentInstanceGetter } from '../spi';
import type { FrameworkInstance } from './typing';

export function useCurrentInstance(): FrameworkInstance {
  return selectorCurrentInstanceGetter({ framework: 'vue' })!();
}

export * from './typing';
