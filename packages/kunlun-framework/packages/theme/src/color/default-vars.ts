import { DEFAULT_PREFIX } from '../mount';

export const defaultVars = {
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
  'error-color-rgb': '224, 32, 32', // 错误色
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
  background: '#ffffff',
  'body-background': '#F3F7FA',
  'search-background': '#ffffff',
  'header-background': '#ffffff',
  'main-background': '#ffffff',
  'footer-background': '#ffffff',
  'menu-background': '#ffffff',

  'placeholder-color': 'rgba(0,0,0,0.25)',

  // hover
  'hover-background-color': `rgba(3, 93, 255, 0.1)`,
  'hover-text-color': `var(--oio-primary-color)`,

  // font
  'font-family':
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol','Noto Color Emoji';",
  'text-color': 'rgba(0,0,0,0.85)',
  'text-color-rgb': '38, 38, 38',
  'text-color-secondary': 'rgba(0,0,0,0.65)',
  'text-color-three': 'rgba(0,0,0,0.45)',

  /**
   * @deprecated Please use --${DEFAULT_PREFIX}-font-weight-bold property.
   */
  'font-weight-thick': `var(--${DEFAULT_PREFIX}-font-weight-bold)`,
  'font-weight': '400',
  'font-weight-lighter': 'lighter',
  'font-weight-bold': 'bold',
  'font-weight-bolder': 'bolder',

  // 只读色调
  'readonly-color': 'rgba(0,0,0,0.85)',
  'readonly-bg': '#F7F7F7',
  'readonly-active-bg': '#F7F7F7',
  'readonly-border-color': 'rgba(217,217,217,1)',

  // 禁用色调
  'disabled-color': 'rgba(0, 0, 0, 0.25)',
  'disabled-bg': '#F7F7F7',
  'disabled-active-bg': '#F7F7F7',
  'disabled-border-color': 'rgba(217,217,217,1)',

  // border
  'border-color': '#e3e7ee',
  'border-color-danger': '#E02020',
  'border-width': '1px',
  'border-style': 'solid',

  // common
  'icon-color': 'rgba(0, 0, 0, 0.25)',
  'default-icon-color': 'rgba(0, 0, 0, 0.25)',
  'normal-icon-filter': '',
  'icon-filter': 'invert(0.7) hue-rotate(180deg) brightness(0.5)',
  'icon-filter-opacity': '0.2',
  'close-icon-background': '#f1f1f1',
  'group-border-width': '1px',
  'box-shadow-size': '6px',
  'box-shadow': 'rgba(136, 156, 176, 0.1) 0px 2px 4px 0px',
  'addon-color-pick-background': '#ffffff',
  'addon-color-pick-readonly-background': `var(--${DEFAULT_PREFIX}-disabled-bg)`,
  'addon-color-pick-border-color': `var(--${DEFAULT_PREFIX}-border-color)`,
  'addon-color-pick-icon-color': '#909399',
  'addon-color-pick-dropdown-background': '#ffffff',
  'addon-color-pick-dropdown-border-color': '#e4e7ed',
  'user-dropdown-icon-color': `rgba(0, 0, 0, 0.25)`,
  'tag-select-background': '#f1f1f1',
  'spin-background': '',
  'gemini-mini-icon-color': '#cfe1ff'
};
