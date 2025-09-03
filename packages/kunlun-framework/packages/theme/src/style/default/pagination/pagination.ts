import { DEFAULT_PREFIX } from '../../../mount';

export const component = 'pagination';

export const cssVars = {
  background: `var(--${DEFAULT_PREFIX}-background)`,
  'border-color': `var(--${DEFAULT_PREFIX}-border-color)`,
  'text-color': `var(--${DEFAULT_PREFIX}-text-color)`,
  'background-active': `var(--${DEFAULT_PREFIX}-primary-color)`,
  'border-color-active': `var(--${DEFAULT_PREFIX}-border-color)`,
  'text-color-active': `#fff`,
  'background-hover': `var(--${DEFAULT_PREFIX}-primary-color-hover)`,
  'border-color-hover': `var(--${DEFAULT_PREFIX}-border-color)`,
  'text-color-hover': '#fff'
};
