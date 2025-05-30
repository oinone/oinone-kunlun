import { DEFAULT_PREFIX } from '../../../mount';

export const component = 'multi-tabs';

export const cssVars = {
  /**
   * 标准样式
   */
  background: '#e9e9e9',
  color: `var(--${DEFAULT_PREFIX}-text-color-secondary)`,
  'active-color': `var(--${DEFAULT_PREFIX}-primary-color)`,
  'active-font-weight': 500,
  'active-background': '#ffffff',
  'icon-color': 'rgba(0, 0, 0, 0.2)',
  'hover-background-color': '#f6f6f6',

  /**
   * 内联样式
   */
  'background-color-inline': '#ffffff',
  'color-inline': `var(--${DEFAULT_PREFIX}-text-color)`,
  'active-color-inline': `var(--${DEFAULT_PREFIX}-primary-color)`,
  'active-background-color-inline': `var(--${DEFAULT_PREFIX}-body-background)`,
  'hover-background-color-inline': `var(--${DEFAULT_PREFIX}-body-background)`,

  /**
   * theme1
   */
  'background-color-theme1': '#f6f6f6',
  'background-color-active-theme1': '#ffffff',
  'border-color-theme1': '#e2e6e9',

  /**
   * theme1 inline
   */
  'background-color-theme1-inline': '#ffffff',
  'background-color-active-theme1-inline': `rgba(var(--${DEFAULT_PREFIX}-primary-color-rgb), 0.2)`,
  'active-color-active-theme1-inline': `var(--${DEFAULT_PREFIX}-primary-color)`,
  'icon-color-active-theme1-inline': `var(--${DEFAULT_PREFIX}-multi-tabs-icon-color)`,

  /**
   * theme2
   */
  'background-color-theme2': '#ffffff',
  'border-color-theme2': '#e2e6e9',

  /**
   * theme3
   */
  'background-color-theme3': '#f6f6f6',
  'background-color-active-theme3': `rgba(var(--${DEFAULT_PREFIX}-primary-color-rgb), 0.2)`,
  'active-color-active-theme3': `var(--${DEFAULT_PREFIX}-primary-color)`,
  'icon-color-active-theme3': `var(--${DEFAULT_PREFIX}-multi-tabs-icon-color)`,

  /**
   * theme3 inline
   */
  'background-color-theme3-inline': '#ffffff',

  /**
   * theme4 inline
   */
  'background-color-theme4-inline': '#ffffff',
  'background-color-active-theme4-inline': `rgba(var(--${DEFAULT_PREFIX}-primary-color-rgb), 0.2)`,
  'active-color-active-theme4-inline': `var(--${DEFAULT_PREFIX}-primary-color)`,
  'icon-color-active-theme4-inline': `var(--${DEFAULT_PREFIX}-multi-tabs-icon-color)`
};
