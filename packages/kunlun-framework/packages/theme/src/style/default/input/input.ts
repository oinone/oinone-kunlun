import { DEFAULT_PREFIX } from '../../../mount';

export const component = 'input';
const prefix = `${DEFAULT_PREFIX}-${component}`;

export const cssVars = {
  // default
  background: '#ffffff',
  'background-color': '#ffffff',
  'border-style': `var(--${DEFAULT_PREFIX}-border-style)`,
  'border-color': `var(--${DEFAULT_PREFIX}-border-color)`,
  outline: 'none',
  shadow: 'none',
  'text-color': `var(--${DEFAULT_PREFIX}-text-color)`,
  'counter-background': '#ffffff',
  'counter-color': 'rgba(0, 0, 0, 0.25)',
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
  'shadow-focus': `0px 0px 0px 2px rgba(var(--${DEFAULT_PREFIX}-primary-color-rgb),0.1);`,
  'text-color-focus': `var(--${prefix}-text-color)`,
  // readonly
  'readonly-border-color': `var(--${DEFAULT_PREFIX}-readonly-border-color)`,
  'error-border-color': '#ff4d4f',
  // disabled
  'disabled-border-color': `var(--${DEFAULT_PREFIX}-disabled-border-color)`,

  'addon-background': '#F7F7F7',
  'addon-color': ' rgba(0,0,0,0.65)',
  'tag-background': 'rgba(3,93,255, 0.1)',
  'clear-background': '#fff',
  'clear-color': 'rgba(0,0,0,.25)'
};
