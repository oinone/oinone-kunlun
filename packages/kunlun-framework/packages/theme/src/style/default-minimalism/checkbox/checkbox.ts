import { DEFAULT_PREFIX } from '../../../mount';

export const component = 'checkbox';

export const cssVars = {
  color: `var(--${DEFAULT_PREFIX}-text-color)`,
  background: `var(--${DEFAULT_PREFIX}-background)`,
  'border-color': `var(--${DEFAULT_PREFIX}-border-color)`,
  'disabled-border-color': `var(--${DEFAULT_PREFIX}-disabled-border-color)`
};
