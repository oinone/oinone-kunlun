import { computed, ComputedRef, InjectionKey } from 'vue';
export { default as OioGallery } from './oio-gallery.vue';

export interface OioGalleryInjectContextOption {
  onRowCheckboxChange: ({ checked: boolean, row: any, rowIndex: number }) => void;
  activeRows: ComputedRef<any[]>;
}

export const OioGalleryInjectContext = {
  onRowCheckboxChange: (a) => {},
  activeRows: computed(() => [] as any[]),
};

export const OioGalleryInjectKey: InjectionKey<OioGalleryInjectContextOption> = Symbol('OioGalleryInjectKey');

