import { computed, type ComputedRef, type InjectionKey } from 'vue';

export { default as OioGallery } from './oio-gallery.vue';

export interface OioGalleryInjectContextOption {
  onRowCheckboxChange: (parameters: { checked: boolean; row: any; rowIndex: number }) => void;
  activeRows: ComputedRef<any[]>;
}

export const OioGalleryInjectContext = {
  onRowCheckboxChange: (a) => {},
  activeRows: computed(() => [] as any[])
};

export const OioGalleryInjectKey: InjectionKey<OioGalleryInjectContextOption> = Symbol('OioGalleryInjectKey');
