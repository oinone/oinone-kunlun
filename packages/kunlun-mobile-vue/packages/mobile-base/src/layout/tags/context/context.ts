import { computed, ComputedRef, inject, InjectionKey, provide } from 'vue';

export interface MaskContext {
  parentHandle: ComputedRef<string>;
  slotName: ComputedRef<string | undefined>;
}

export const defaultMaskContext: MaskContext = {
  parentHandle: computed(() => ''),
  slotName: computed(() => undefined)
};

const MaskContextKey: InjectionKey<MaskContext> = Symbol('__mask_context__');

export function useProviderMaskContext(state: Partial<MaskContext>): void {
  provide(MaskContextKey, {
    ...defaultMaskContext,
    ...state
  });
}

export function useInjectMaskContext(): MaskContext {
  return inject(MaskContextKey, defaultMaskContext);
}
