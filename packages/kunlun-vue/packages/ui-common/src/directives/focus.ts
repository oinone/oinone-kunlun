import type { ObjectDirective } from 'vue';

export const vFocus: ObjectDirective<HTMLElement, void> = {
  mounted: (el) => {
    el.focus();
  }
};
