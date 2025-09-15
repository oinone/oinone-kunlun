import { DEFAULT_PREFIX } from '../../../mount';

export const component = 'multi-tabs';

export const cssVars = {
  /**
   * 标准样式
   */
  background: `var(--${DEFAULT_PREFIX}-body-background)`,
  color: `var(--${DEFAULT_PREFIX}-text-color)`,
  'active-color': '#ffffff',
  'active-font-weight': 500,
  'active-background': `var(--${DEFAULT_PREFIX}-background)`,
  'icon-color': 'rgba(255, 255, 255, 0.3)',
  'hover-background-color': 'rgba(255, 255, 255, 0.10)',

  /**
   * 内联样式
   */
  'background-color-inline': `var(--${DEFAULT_PREFIX}-background)`,
  'color-inline': `var(--${DEFAULT_PREFIX}-text-color)`,
  'active-color-inline': `var(--${DEFAULT_PREFIX}-primary-color)`,
  'active-background-color-inline': `var(--${DEFAULT_PREFIX}-body-background)`,
  'hover-background-color-inline': `var(--${DEFAULT_PREFIX}-body-background)`,

  /**
   * theme1
   */
  'background-color-theme1': `var(--${DEFAULT_PREFIX}-body-background)`,
  'background-color-active-theme1': `var(--${DEFAULT_PREFIX}-background)`,
  'border-color-theme1': 'var(--oio-border-color)',

  /**
   * theme1 inline
   */
  'background-color-theme1-inline': `var(--${DEFAULT_PREFIX}-background)`,
  'background-color-active-theme1-inline': `rgba(255, 255, 255, 0.2)`,
  'active-color-active-theme1-inline': `#ffffff`,
  'icon-color-active-theme1-inline': `var(--${DEFAULT_PREFIX}-multi-tabs-icon-color)`,

  /**
   * theme2
   */
  'background-color-theme2': `var(--${DEFAULT_PREFIX}-background)`,
  'border-color-theme2': 'var(--oio-border-color)',

  /**
   * theme3
   */
  'background-color-theme3': `var(--${DEFAULT_PREFIX}-body-background)`,
  'background-color-active-theme3': `rgba(255, 255, 255, 0.2)`,
  'active-color-active-theme3': `#ffffff`,
  'icon-color-active-theme3': `var(--${DEFAULT_PREFIX}-multi-tabs-icon-color)`,

  /**
   * theme3 inline
   */
  'background-color-theme3-inline': `var(--${DEFAULT_PREFIX}-background)`,

  /**
   * theme4 inline
   */
  'background-color-theme4-inline': `var(--${DEFAULT_PREFIX}-background)`,
  'background-color-active-theme4-inline': `rgba(255, 255, 255, 0.2)`,
  'active-color-active-theme4-inline': `#ffffff`,
  'icon-color-active-theme4-inline': `var(--${DEFAULT_PREFIX}-multi-tabs-icon-color)`
};
