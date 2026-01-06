import { currentOioThemeType, DefaultThemeName, isSystemTheme, setCurrentThemeType } from '../index';

describe('currentTheme', () => {
  it('默认主题为 default', () => {
    expect(currentOioThemeType).toBe('default');
  });

  it('setCurrentThemeType 可以修改当前主题', () => {
    setCurrentThemeType('dark');
    expect(currentOioThemeType).toBe('dark');
    setCurrentThemeType('default');
  });
});

describe('isSystemTheme', () => {
  it('可以识别系统内置主题', () => {
    expect(isSystemTheme(DefaultThemeName.DEFAULT_LARGE)).toBe(true);
    expect(isSystemTheme('custom-theme')).toBe(false);
  });
});
