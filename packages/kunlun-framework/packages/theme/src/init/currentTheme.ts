import { ThemeType } from '../typing';

export let currentOioThemeType: ThemeType = 'default';

export function setCurrentThemeType(themeType: ThemeType) {
  currentOioThemeType = themeType;
}
