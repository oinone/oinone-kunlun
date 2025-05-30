import { computed, ComputedRef, inject, InjectionKey, provide } from 'vue';
import { $$OioTabPosition, OioTabPosition } from './props';

export interface TabHTMLNode {
  el: HTMLElement;
  key?: string;
  index: number;
}

export interface OioTabsContext {
  id: ComputedRef<string | undefined>;
  nodes: ComputedRef<TabHTMLNode[]>;
  moreNodes: ComputedRef<TabHTMLNode[]>;
  tabPosition: ComputedRef<OioTabPosition | $$OioTabPosition>;
}

export const defaultOioTabsContext: OioTabsContext = {
  id: computed(() => undefined),
  nodes: computed(() => []),
  moreNodes: computed(() => []),
  tabPosition: computed(() => OioTabPosition.top)
};

export const OioTabsContextKey: InjectionKey<OioTabsContext> = Symbol('OioTabsContext');

export const useProviderOioTabsContext = (state: Partial<OioTabsContext>): void => {
  provide(OioTabsContextKey, {
    ...defaultOioTabsContext,
    ...state
  });
};

export const useInjectOioTabsContext = (): OioTabsContext => {
  return inject(OioTabsContextKey, defaultOioTabsContext);
};
