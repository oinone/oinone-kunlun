import { DEFAULT_PREFIX } from '../../../mount';

export const component = 'dropdown';

export const cssVars = {
  'background-color': `var(--${DEFAULT_PREFIX}-background)`,
  'background-hover': `var(--${DEFAULT_PREFIX}-hover-background-color)`,
  'border-color': `var(--${DEFAULT_PREFIX}-border-color)`,
  'box-shadow': '-2px 2px 6px 0px rgba(136, 156, 176, 0.2)',
  color: `var(--${DEFAULT_PREFIX}-text-color)`,
  'color-hover': `var(--${DEFAULT_PREFIX}-hover-text-color)`,
  'color-disabled': `var(--${DEFAULT_PREFIX}-disabled-color)`,
  'color-disabled-hover': `var(--${DEFAULT_PREFIX}-disabled-color)`,

  'item-background-color-hover': `var(--${DEFAULT_PREFIX}-hover-background-color)`,
  'item-background-color-disabled-hover': 'transparent',
  'button-text-color': `var(--${DEFAULT_PREFIX}-button-link-text-color)`
};
