import { DEFAULT_PREFIX } from '../../../mount';

export const component = 'upload';
const prefix = `${DEFAULT_PREFIX}-${component}`;

export const cssVars = {
  // default
  background: '#ffffff',
  'border-width': `var(--${DEFAULT_PREFIX}-border-width)`,
  'border-style': 'dashed',
  'border-color': `var(--${DEFAULT_PREFIX}-border-color)`,
  'border-radius': `var(--${DEFAULT_PREFIX}-border-radius)`,
  outline: 'none',
  shadow: 'none',
  'text-color': `var(--${DEFAULT_PREFIX}-text-color)`,
  // default-hover
  'background-hover': `var(--${prefix}-background)`,
  'border-width-hover': `var(--${prefix}-border-width)`,
  'border-style-hover': `var(--${prefix}-border-style)`,
  'border-color-hover': `var(--${DEFAULT_PREFIX}-primary-color-hover)`,
  'border-radius-hover': `var(--${prefix}-border-radius)`,
  'outline-hover': `var(--${prefix}-outline)`,
  'shadow-hover': `var(--${prefix}-shadow)`,
  'text-color-hover': `var(--${prefix}-text-color)`,
  // default-focus
  'background-focus': `var(--${prefix}-background)`,
  'border-width-focus': `var(--${prefix}-border-width)`,
  'border-style-focus': `var(--${prefix}-border-style)`,
  'border-color-focus': `var(--${DEFAULT_PREFIX}-primary-color-hover)`,
  'border-radius-focus': `var(--${prefix}-border-radius)`,
  'outline-focus': `var(--${prefix}-outline)`,
  'shadow-focus': `var(--${prefix}-shadow)`,
  'text-color-focus': `var(--${prefix}-text-color)`
};
