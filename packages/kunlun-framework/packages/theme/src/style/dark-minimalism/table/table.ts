import { DEFAULT_PREFIX } from '../../../mount';

export const component = 'table';

export const cssVars = {
  'thead-bg': `var(--oio-background)`,
  'body-bg': `var(--oio-background)`,
  'text-color': `var(--${DEFAULT_PREFIX}-text-color)`,
  'title-color': 'rgba(255,255,255,0.85)',
  'title-font-weight': 500,
  'title-sort-icon-size': '11px',
  'tr-height': `var(--${DEFAULT_PREFIX}-height-lg)`,
  'tr-stripe-bg': 'rgba(255,255,255,0.1)',
  'tr-checked-bg': 'rgba(255,255,255,0.1)',
  'tr-hover-bg': 'rgba(255,255,255,0.1)',
  'row-border': 'rgba(51,62,76,1)',
  'row-body-border': 'rgba(51,62,76,1)',
  config: {
    border: 'full',
    stripe: false,
    isCurrent: true,
    isHover: true
  }
};

// export const cssVars = {
//   'thead-bg': `var(--oio-background)`,
//   'body-bg': `var(--oio-background)`,
//   'title-color': 'rgba(255,255,255,0.85)',
//   'title-font-weight': bold,
//   'title-sort-icon-size': '11px',
//   'tr-height': `var(--${DEFAULT_PREFIX}-height-lg)`,
//   'tr-stripe-bg': 'rgba(255,255,255,0.1)',
//   'tr-checked-bg': 'rgba(255,255,255,0.1)',
//   'tr-hover-bg': 'rgba(255,255,255,0.1)',
//   'row-border': 'rgba(51,62,76,1)',
//   'row-body-border': 'rgba(51,62,76,1)',
//   config: {
//     border: 'oinone-custom-border',
//     stripe: false,
//     isCurrent: true,
//     isHover: true
//   }
// };
