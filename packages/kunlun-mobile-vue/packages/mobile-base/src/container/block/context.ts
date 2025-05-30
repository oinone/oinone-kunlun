import { FlexDirection } from '@kunlun/vue-ui-common';
import { computed, ComputedRef, inject, InjectionKey, provide } from 'vue';

export interface OioDefaultRowContext {
  flexDirection: ComputedRef<FlexDirection>;
  wrap: ComputedRef<boolean>;
}

export interface OioDefaultRowContextOptions {
  flexDirection?: ComputedRef<FlexDirection>;
  wrap?: ComputedRef<boolean>;
}

export const defaultDefaultRowContext: OioDefaultRowContext = {
  flexDirection: computed(() => FlexDirection.Row),
  wrap: computed(() => true)
};

export const OioDefaultRowContextKey: InjectionKey<OioDefaultRowContext> = Symbol('OioDefaultRowContext');

export const useProviderOioDefaultRowContext = (state: OioDefaultRowContextOptions): void => {
  provide(OioDefaultRowContextKey, {
    ...defaultDefaultRowContext,
    ...state
  });
};

export const useInjectOioDefaultRowContext = (): OioDefaultRowContext => {
  return inject(OioDefaultRowContextKey, defaultDefaultRowContext);
};
