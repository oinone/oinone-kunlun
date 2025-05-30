import { inject, InjectionKey, provide } from 'vue';

/**
 * 下拉的高度「时间组件」
 */
const dropdownMinHeight = 350;

/**
 * 下拉的高度「select组件」
 */
const normalDropdownMinHeight = 300;

export interface OioDefaultFormContext {
  getTriggerContainer: (triggerNode: Node | HTMLElement) => Node | HTMLElement;
}

export const OioDefaultFormContextKey: InjectionKey<OioDefaultFormContext> = Symbol('OioDefaultFormContext');

export const useProviderOioDefaultFormContext = (state: OioDefaultFormContext): void => {
  provide(OioDefaultFormContextKey, state);
};

export const useInjectOioDefaultFormContext = (): OioDefaultFormContext => {
  return inject(OioDefaultFormContextKey, {
    getTriggerContainer: (triggerNode) => {
      const node = triggerNode as HTMLElement;

      const table = node.closest('.oio-table');
      const tableClientHeight = table?.clientHeight || 0;

      if (table && tableClientHeight < dropdownMinHeight) {
        return document.body;
      }

      const modal = node.closest('.oio-modal');
      const parentNode = node.parentNode as HTMLElement;

      if (modal) {
        const modalBodyHeight = modal.querySelector('.ant-modal-body')?.clientHeight || 0;

        const miniHeight = !!parentNode?.closest('.oio-select') ? normalDropdownMinHeight : dropdownMinHeight;

        if (modalBodyHeight < miniHeight) {
          return document.body;
        }
      }

      return parentNode || document.body;
    }
  });
};
