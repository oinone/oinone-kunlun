import { inject, type InjectionKey, provide } from 'vue';
import type { OioTableInstance } from './typing';

const OioTableContextKey: InjectionKey<OioTableInstance> = Symbol('OioTableContext');

export const useProviderOioTableInstance = (state: OioTableInstance): void => {
  provide(OioTableContextKey, state);
};

export const useInjectOioTableInstance = (): OioTableInstance | undefined => {
  return inject(OioTableContextKey);
};
