import { type ComputedRef, inject, type InjectionKey, provide } from 'vue';
import type { UserSearchPrefer } from '../../typing';

export interface SearchPreferContext {
  selected: ComputedRef<UserSearchPrefer | undefined>;
  options: ComputedRef<UserSearchPrefer[] | undefined>;
}

const SearchPreferContextKey: InjectionKey<SearchPreferContext> = Symbol('SearchPreferContext');

export function useProviderSearchPreferContext(state: SearchPreferContext): void {
  provide(SearchPreferContextKey, state);
}

export function useInjectSearchPreferContext(): SearchPreferContext | undefined {
  return inject(SearchPreferContextKey);
}
