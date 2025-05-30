import { computed, ComputedRef, inject, InjectionKey, provide } from 'vue';

export interface OioCollapseInstance {
  getPanelKeys(): string[];
}

export interface OioCollapseContext {
  keys: ComputedRef<string[]>;
  showArrow: ComputedRef<boolean>;
  collapsible: ComputedRef<string | undefined>;

  reportPanelKey(key: string);
}

export const defaultOioCollapseContext: OioCollapseContext = {
  keys: computed(() => []),
  showArrow: computed(() => true),
  collapsible: computed(() => undefined),
  reportPanelKey() {
    console.error('Invalid report key method.');
  }
};

export const OioCollapseContextKey: InjectionKey<OioCollapseContext> = Symbol('OioCollapseContext');

export const useProviderOioCollapseContext = (state: Partial<OioCollapseContext>): void => {
  provide(OioCollapseContextKey, {
    ...defaultOioCollapseContext,
    ...state
  });
};

export const useInjectOioCollapseContext = (): OioCollapseContext => {
  return inject(OioCollapseContextKey, defaultOioCollapseContext);
};
