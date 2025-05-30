import { DEFAULT_PREFIX } from '../../../mount';

export const component = 'rich-text';

export const cssVars = {
  'textarea-bg-color': `var(--${DEFAULT_PREFIX}-background)`,
  'textarea-color': `var(--${DEFAULT_PREFIX}-text-color)`,
  'textarea-border-color': `var(--${DEFAULT_PREFIX}-border-color)`,
  'textarea-slight-border-color': `var(--${DEFAULT_PREFIX}-border-color)`,
  'textarea-slight-color': `var(--${DEFAULT_PREFIX}-text-color)`,
  'textarea-slight-bg-color': `var(--${DEFAULT_PREFIX}-body-background)`,
  'textarea-selected-border-color': '#b4d5ff',
  'textarea-handler-bg-color': '#4290f7',
  'toolbar-color': `var(--${DEFAULT_PREFIX}-select-dropdown-color)`,
  'toolbar-bg-color': `var(--${DEFAULT_PREFIX}-select-dropdown-background)`,
  'toolbar-active-color': `var(--${DEFAULT_PREFIX}-select-dropdown-selected-color)`,
  'toolbar-active-bg-color': `var(--${DEFAULT_PREFIX}-select-dropdown-selected)`,
  'toolbar-color-active-bg-color': `var(--${DEFAULT_PREFIX}-primary-color)`,
  'toolbar-disabled-color': `var(--${DEFAULT_PREFIX}-disabled-color)`,
  'toolbar-border-color': `var(--${DEFAULT_PREFIX}-border-color)`,
  'modal-button-bg-color': '#fafafa',
  'modal-button-border-color': '#d9d9d9',
  'button-tooltip-bg-color': '#333',
  'button-tooltip-color': '#fff'
};
