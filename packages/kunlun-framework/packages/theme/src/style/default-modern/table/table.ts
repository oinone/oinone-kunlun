import { DEFAULT_PREFIX } from '../../../mount';

export const component = 'table';

export const cssVars = {
  'thead-bg': '#f7f8fa',
  'body-bg': '#ffffff',
  'text-color': 'rgba(0, 0, 0, 0.65)',
  'title-color': 'rgba(0, 0, 0, 0.85)',
  'title-font-weight': 500,
  'title-sort-icon-size': '11px',
  'tr-height': `var(--${DEFAULT_PREFIX}-height-lg)`,
  'tr-stripe-bg': '#fafafa',
  'tr-checked-bg': `rgba(var(--${DEFAULT_PREFIX}-primary-color-rgb), 0.1)`,
  'tr-hover-bg': `rgba(var(--${DEFAULT_PREFIX}-primary-color-rgb), 0.1)`,
  'row-border': 'rgba(243, 243, 243, 1)', // 无效参数
  'row-body-border': '#e8eaec',
  config: {
    border: 'full',
    stripe: true,
    isCurrent: true,
    isHover: true
  }
};

// export const cssVars = {
//   'thead-bg': '#ffffff',
//   'body-bg': '#ffffff',
//   'title-color': 'rgba(0, 0, 0, 0.85)',
//   'title-font-weight': 'bold',
//   'title-sort-icon-size': '11px',
//   'tr-height': `var(--${DEFAULT_PREFIX}-height-lg)`,
//   'tr-stripe-bg': '#fafafa',
//   'tr-checked-bg': `rgba(var(--${DEFAULT_PREFIX}-primary-color-rgb), 0.1)`,
//   'tr-hover-bg': `rgba(var(--${DEFAULT_PREFIX}-primary-color-rgb), 0.1)`,
//   'row-border': 'rgba(243, 243, 243, 1)',
//   'row-body-border': '#e8eaec',
//   config: {
//     border: 'oinone-custom-border',
//     stripe: false,
//     isCurrent: true,
//     isHover: true
//   }
// };
