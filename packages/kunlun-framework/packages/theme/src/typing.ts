export type ThemeType = 'default' | 'dark';

export type ThemeSize = 'large' | 'medium' | 'small';

export interface DefaultSideBarTheme {
  mode?: ThemeType;
}

export enum DefaultThemeName {
  DEFAULT_LARGE = 'default-large',
  DEFAULT_MEDIUM = 'default-medium',
  DEFAULT_SMALL = 'default-small',

  DARK_LARGE = 'dark-large',
  DARK_MEDIUM = 'dark-medium',
  DARK_SMALL = 'dark-small'
}

export type ThemeName =
  | 'default-large'
  | 'default-medium'
  | 'default-small'
  | 'dark-large'
  | 'dark-medium'
  | 'dark-small'
  | string;

export const isSystemTheme = (name: ThemeName) => {
  const values = Object.values(DefaultThemeName);
  return values.includes(name as any);
};
