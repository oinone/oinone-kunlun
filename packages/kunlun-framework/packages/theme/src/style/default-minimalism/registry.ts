import { registerTheme } from '../../register';
import { ThemeSize } from '../../typing';
import { getComponentTheme } from './component-theme';

import { defaultModernVars } from '../../color';
import { defaultLargeSizeVars, defaultMediumSizeVars, defaultSmallSizeVars } from '../../size';

function registerComponentThemeWithBase(baseCssVars) {
  return function registerComponentTheme(
    component: string,
    componentCSSVars: Record<string, string | number | boolean | Record<string, unknown>>
  ): void {
    Object.entries(componentCSSVars).forEach(([key, value]) => {
      baseCssVars[`${component}-${key}`] = value;
    });
  };
}

function registerDefaultTheme(size: ThemeSize) {
  const defaultSizeVars =
    // eslint-disable-next-line no-nested-ternary
    size === 'large' ? defaultLargeSizeVars : size === 'medium' ? defaultMediumSizeVars : defaultSmallSizeVars;

  const cssVars = {
    ...defaultModernVars,
    ...defaultSizeVars
  };

  const registerComponentTheme = registerComponentThemeWithBase(cssVars);

  /**
   * componentTheme 数据格式如下：
   *
   * {
   *   input: {
   *     large: {.....},
   *     medium: {.....},
   *     small: {.....},
   *   },
   *   button: {
   *     large: {.....},
   *     medium: {.....},
   *     small: {.....},
   *   },
   *   .....
   * }
   */

  const componentTheme = getComponentTheme();
  Object.entries(componentTheme).forEach(([key, value]) => {
    if (value[size]) {
      registerComponentTheme(key, value[size]);
    }
  });

  registerTheme(`default-minimalism-${size}`, cssVars);
}

export function registerDefaultModernThemeFn() {
  registerDefaultTheme('large');
  registerDefaultTheme('medium');
  registerDefaultTheme('small');
}
