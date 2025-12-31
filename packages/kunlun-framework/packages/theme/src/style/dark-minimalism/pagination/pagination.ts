import { DEFAULT_PREFIX } from '../../../mount';

export const component = 'pagination';

export const cssVars = {
  background: `var(--${DEFAULT_PREFIX}-background)`,
  'border-color': 'none',
  'text-color': `var(--${DEFAULT_PREFIX}-text-color)`,
  'background-active': 'transparent',
  'border-color-active': `var(--${DEFAULT_PREFIX}-primary-color)`,
  'text-color-active': `var(--${DEFAULT_PREFIX}-text-color)`,
  'background-hover': `var(--${DEFAULT_PREFIX}-primary-color-hover)`,
  'border-color-hover': 'transparent',
  'text-color-hover': `var(--${DEFAULT_PREFIX}-text-color)`
};
