import { computed, type ComputedRef, inject, type InjectionKey, provide } from 'vue';
import { IEmptyPlaceholder, type OioBaseContainerPropsType } from '../../typing';
import { FormLayout } from './props';

export interface OioFormContext {
  layout: ComputedRef<FormLayout | undefined>;
  emptyPlaceholder: ComputedRef<IEmptyPlaceholder | undefined>;
}

export const defaultOioFormContext: OioFormContext = {
  layout: computed(() => undefined),
  emptyPlaceholder: computed(() => undefined)
};

export const OioFormContextKey: InjectionKey<OioFormContext> = Symbol('OioFormContext');

export const useProviderOioFormContext = (
  state: Partial<Omit<OioFormContext, 'layout'> & { layout: ComputedRef<FormLayout | undefined> }>
): void => {
  provide(OioFormContextKey, {
    ...defaultOioFormContext,
    ...state
  });
};

export const useInjectOioFormContext = (): OioFormContext => {
  return inject(OioFormContextKey, defaultOioFormContext);
};

export function useOioFormLayoutContext(
  props: Omit<OioBaseContainerPropsType, 'layout'> & { layout: FormLayout | keyof typeof FormLayout | undefined }
) {
  const formContext = useInjectOioFormContext();

  const layout = computed(() => {
    return props.layout || formContext.layout.value;
  });

  useProviderOioFormContext({
    ...formContext,
    layout: layout as ComputedRef<FormLayout | undefined>
  });

  return {
    layout
  };
}
