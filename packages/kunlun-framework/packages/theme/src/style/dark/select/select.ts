import { DEFAULT_PREFIX } from '../../../mount';

export const component = 'select';
const prefix = `${DEFAULT_PREFIX}-${component}`;

export const cssVars = {
  // default
  background: '#15232E',
  'border-width': `var(--${DEFAULT_PREFIX}-border-width)`,
  'border-style': `var(--${DEFAULT_PREFIX}-border-style)`,
  'border-color': `var(--${DEFAULT_PREFIX}-border-color)`,
  'border-radius': `var(--${DEFAULT_PREFIX}-border-radius)`,
  outline: 'none',
  shadow: 'none',
  'text-color': `var(--${DEFAULT_PREFIX}-text-color)`,
  'counter-background': '#15232E',
  'counter-color': 'rgba(255,255,255,0.65)',
  'counter-font-size': `var(--${DEFAULT_PREFIX}-font-size-sm)`,
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
  'shadow-focus': `0px 0px 0px 2px rgba(3,93,255,0.1);`,
  'text-color-focus': `var(--${prefix}-text-color)`,
  // readonly
  'readonly-border-color': `var(--${DEFAULT_PREFIX}-readonly-border-color)`,
  'item-readonly-bg': `var(--${DEFAULT_PREFIX}-primary-color-rgb)`,
  'item-readonly-color': `var(--${DEFAULT_PREFIX}-primary-color)`,
  'item-readonly-radius': `var(--${DEFAULT_PREFIX}-border-radius)`,

  'dropdown-background': '#1F2935',
  'dropdown-selected-color': '#fff',
  'dropdown-color': 'rgba(255,255,255,0.65)',
  'dropdown-selected': 'rgba(255,255,255,0.1)',
  'dropdown-box-shadow': '0px 0px 6px 0px rgba(0,0,0,0.2)'
};
