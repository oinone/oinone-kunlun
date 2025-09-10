import { DEFAULT_PREFIX } from '../../../mount';

export const component = 'card';

export const cssVars = {
  'action-background': '#F7F8FA;',
  'action-border-color': 'transparent',
  'action-divider-color': `var(--${DEFAULT_PREFIX}-border-color)`,
  'action-text-color': `var(--${DEFAULT_PREFIX}-text-color-secondary)`
};
