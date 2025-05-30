import { ObjectDirective } from '@vue/runtime-core';

export const vFocus: ObjectDirective<HTMLElement, void> = {
  mounted: (el) => {
    el.focus();
  }
};
