import { darkVars } from '../../color';
import { registerTheme } from '../../register';
import { defaultLargeSizeVars, defaultMediumSizeVars, defaultSmallSizeVars } from '../../size';
import { ThemeSize } from '../../typing';
import { getComponentTheme } from './component-theme';

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
    ...darkVars,
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

  registerTheme(`dark-${size}`, cssVars);
}

export function registerDarkThemeFn() {
  registerDefaultTheme('large');
  registerDefaultTheme('medium');
  registerDefaultTheme('small');
}
