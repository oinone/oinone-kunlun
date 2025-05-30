import { DEFAULT_PREFIX } from '../mount';

export const darkVars = {
  // primary
  'primary-color-rgb': '3, 93, 255', // 主色
  'primary-color': '#035DFF', // 主色
  'primary-color-hover': '#3F84FF', // 主悬停色
  'primary-color-focus': '#3F84FF', // 主焦点色
  'primary-color-active': '#024CDE', // 主激活色
  'primary-color-outline': '#035DFF', // 主轮廓色
  // success
  'success-color': '#6DD400', // 成功色
  'success-color-hover': '#90DE3D', // 成功悬停色
  'success-color-focus': '#90DE3D', // 成功悬停色
  'success-color-active': '#6BBB00', // 成功激活色
  'success-color-outline': '#6DD400', // 成功轮廓色
  // waring
  'warning-color': '#F7B500', // 警告色
  'warning-color-hover': '#F9C73D', // 警告悬停色
  'warning-color-focus': '#F9C73D', // 警告悬停色
  'warning-color-active': '#D99200', // 警告激活色
  'warning-color-outline': '#F7B500', // 警告轮廓色
  // info
  'info-color': '#8c8c8c', // 通知色
  'info-color-hover': '#999999', // 通知悬停色
  'info-color-focus': '#999999', // 通知悬停色
  'info-color-active': '#666666', // 通知激活色
  'info-color-outline': '#8c8c8c', // 通知轮廓色
  // error
  'error-color': '#E02020', // 错误色
  'error-color-hover': '#E75555',
  'error-color-focus': '#E75555',
  'error-color-active': '#C51C26',
  'error-color-outline': '#E02020',

  // 消息icon颜色
  'notification-info': '#035DFF',
  'notification-error': '#FF4D4F',
  'notification-success': '#52C41A',
  'notification-warning': '#FAAD14',

  // background
  background: '#1F2935',
  'body-background': '#15232E',
  'search-background': '#1F2935',
  'header-background': '#1F2935',
  'main-background': '#1F2935',
  'footer-background': '#1F2935',
  'menu-background': '#1F2935',
  'multi-tabs-background': '#F3F7FA',
  'placeholder-color': 'rgba(255,255,255,0.25)',

  // hover
  'hover-background-color': `rgba(255, 255, 255, 0.1)`,
  'hover-text-color': `var(--oio-text-color)`,

  // font
  'font-family':
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol','Noto Color Emoji';",
  'text-color': 'rgba(255,255,255,0.65)',
  'text-color-rgb': '38, 38, 38',
  'text-color-secondary': 'rgba(255,255,255,0.45)',
  'text-color-three': 'rgba(255,255,255,0.25)',

  /**
   * @deprecated Please use --${DEFAULT_PREFIX}-font-weight-bold property.
   */
  'font-weight-thick': `var(--${DEFAULT_PREFIX}-font-weight-bold)`,
  'font-weight': '400',
  'font-weight-lighter': 'lighter',
  'font-weight-bold': 'bold',
  'font-weight-bolder': 'bolder',

  // 只读色调
  'readonly-color': 'rgba(255,255,255,0.65)',
  'readonly-bg': '#1D2E3C',
  'readonly-active-bg': '#1D2E3C',
  'readonly-border-color': '#333e4c',

  // 禁用色调
  'disabled-color': 'rgba(255,255,255,0.25)',
  'disabled-bg': '#1D2E3C',
  'disabled-active-bg': '#1D2E3C',
  'disabled-border-color': '#333e4c',

  // border
  'border-color': '#333e4c',
  'border-color-danger': '#E02020',
  'border-width': '1px',
  'border-style': 'solid',

  // common
  'icon-color': 'rgba(255,255,255,0.65)',
  'default-icon-color': 'rgba(255,255,255,0.65)',
  'normal-icon-filter': `var(--${DEFAULT_PREFIX}-icon-filter)`,
  'icon-filter': 'invert(0.7) hue-rotate(180deg) brightness(0.5)',
  'icon-filter-opacity': '0.4',
  'close-icon-background': '#333E4C',
  'group-border-width': '0px',
  'box-shadow-size': '0px',
  'box-shadow': '0px 0px 6px 0px rgba(0,0,0,0.2)',
  'addon-color-pick-background': `var(--${DEFAULT_PREFIX}-primary-color)`,
  'addon-color-pick-readonly-background': 'rgba(92,104,127, 0.25)',
  'addon-color-pick-border-color': '#ffffff',
  'addon-color-pick-icon-color': '#ffffff',
  'addon-color-pick-dropdown-background': `var(--${DEFAULT_PREFIX}-background)`,
  'addon-color-pick-dropdown-border-color': `var(--${DEFAULT_PREFIX}-border-color)`,
  'user-dropdown-icon-color': `var(--${DEFAULT_PREFIX}-text-color)`,
  'tag-select-background': 'rgba(255,255,255,0.1)',
  'spin-background': 'rgba(31,41,53,0.7)',
  'gemini-mini-icon-color': 'rgba(3,93,255, 0.2)'
};
