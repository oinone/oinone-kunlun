import { computed, ComputedRef, inject, InjectionKey, provide } from 'vue';

export interface ActionContext {
  isSelectItem: ComputedRef<boolean>;
}

const defaultActionContext: ActionContext = {
  isSelectItem: computed(() => false)
};

export const ActionContextKey: InjectionKey<ActionContext> = Symbol('ActionContextKey');

export function useProviderActionContext(state: Partial<ActionContext>): void {
  provide(ActionContextKey, {
    ...defaultActionContext,
    ...state
  });
}

export function useInjectActionContext(): ActionContext {
  return inject(ActionContextKey, defaultActionContext);
}
