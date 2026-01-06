import { inject, type InjectionKey, provide } from 'vue';

export interface OioCardContext {
  scope: string | undefined;
}

export enum OioCardScope {
  title = 'title',
  content = 'content'
}

export const defaultOioCardContext: OioCardContext = {
  scope: undefined
};

export const OioCardContextKey: InjectionKey<OioCardContext> = Symbol('OioCardContext');

export const useProviderOioCardContext = (state: Partial<OioCardContext>): void => {
  provide(OioCardContextKey, {
    ...defaultOioCardContext,
    ...state
  });
};

export const useInjectOioCardContext = (): OioCardContext => {
  return inject(OioCardContextKey, defaultOioCardContext);
};
