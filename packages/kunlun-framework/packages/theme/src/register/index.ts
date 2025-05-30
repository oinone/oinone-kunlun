import { ThemeName } from '../typing';

const themeMap = new Map<string, Record<string, unknown>>();

const registerTheme = (theme: ThemeName, cssVars: Record<string, unknown>) => {
  themeMap.set(theme, cssVars);
};

const getTheme = (theme: ThemeName) => {
  return themeMap.get(theme);
};

const registerThemeItem = (theme: ThemeName, cssVars: Record<string, unknown>) => {
  const _theme = theme;
  const themeObj = themeMap.get(_theme);
  if (themeObj) {
    Object.assign(themeObj, cssVars);
  } else {
    themeMap.set(_theme, cssVars);
  }
};

export { themeMap, registerTheme, getTheme, registerThemeItem };
