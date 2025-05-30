import { registerDarkThemeFn, registerDefaultThemeFn } from '../style';
import { DefaultSideBarTheme, ThemeType } from '../typing';
import { setCurrentThemeType } from './currentTheme';

interface DefaultComponentTheme {
  sideBarTheme: DefaultSideBarTheme;
}

export function initOioComponentTheme(config: Partial<DefaultComponentTheme>) {
  const mode = config.sideBarTheme?.mode || 'default';
  setCurrentThemeType(mode.toLocaleLowerCase() as ThemeType);
  registerDefaultThemeFn();
  registerDarkThemeFn();
}
