import { inject, InjectionKey, provide } from 'vue';

export interface OioDefaultFormContext {
  getTriggerContainer: (triggerNode: Node | HTMLElement) => Node | HTMLElement;
}

export const OioDefaultFormContextKey: InjectionKey<OioDefaultFormContext> = Symbol('OioDefaultFormContext');

export const useProviderOioDefaultFormContext = (state: OioDefaultFormContext): void => {
  provide(OioDefaultFormContextKey, state);
};

export const useInjectOioDefaultFormContext = (): OioDefaultFormContext => {
  return inject(OioDefaultFormContextKey, {
    getTriggerContainer: (triggerNode) => triggerNode.parentNode || document.body
  });
};
