import { ViewType } from '@kunlun/meta';
import { computed, ComputedRef, inject, InjectionKey, provide } from 'vue';

/**
 * 元数据上下文
 */
export interface MetaContext {
  viewType: ComputedRef<ViewType>;
  model: ComputedRef<string>;
  modelName: ComputedRef<string>;
  module: ComputedRef<string>;
  moduleName: ComputedRef<string>;
  metadataHandle: ComputedRef<string>;
  rootHandle: ComputedRef<string>;
  parentHandle: ComputedRef<string>;
  slotName: ComputedRef<string | undefined>;
  inline: ComputedRef<boolean>;
}

/**
 * 默认元数据上下文
 */
export const defaultMetaContext = {
  viewType: computed(() => ViewType.Form),
  model: computed(() => ''),
  modelName: computed(() => ''),
  module: computed(() => ''),
  moduleName: computed(() => ''),
  metadataHandle: computed(() => ''),
  rootHandle: computed(() => ''),
  parentHandle: computed(() => ''),
  slotName: computed(() => undefined),
  inline: computed(() => false)
};

/**
 * 元数据Provider/Inject键
 */
const MetaContextKey: InjectionKey<MetaContext> = Symbol('MetaContext');

/**
 * 提供元数据上下文
 * @param state 元数据可选项
 */
export const useProviderMetaContext = (state: Partial<MetaContext>): void => {
  provide(MetaContextKey, {
    ...defaultMetaContext,
    ...state
  });
};

/**
 * 获取元数据上下文
 */
export const useInjectMetaContext = (): MetaContext => {
  return inject(MetaContextKey, defaultMetaContext);
};
