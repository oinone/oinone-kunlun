export type ThemeType = 'default' | 'dark';

export type ThemeSize = 'large' | 'medium' | 'small';

export interface DefaultSideBarTheme {
  mode?: ThemeType;
}

export enum DefaultThemeName {
  DEFAULT_LARGE = 'default-large',
  DEFAULT_MEDIUM = 'default-medium',
  DEFAULT_SMALL = 'default-small',

  DEFAULT_MINIMALISM_LARGE = 'default-minimalism-large',
  DEFAULT_MINIMALISM_MEDIUM = 'default-minimalism-medium',
  DEFAULT_MINIMALISM_SMALL = 'default-minimalism-small',

  DARK_LARGE = 'dark-large',
  DARK_MEDIUM = 'dark-medium',
  DARK_SMALL = 'dark-small',

  DARK_MINIMALISM_LARGE = 'dark-minimalism-large',
  DARK_MINIMALISM_MEDIUM = 'dark-minimalism-medium',
  DARK_MINIMALISM_SMALL = 'dark-minimalism-small'
}

export type ThemeName =
  | 'default-large'
  | 'default-medium'
  | 'default-small'
  | 'default-minimalism-large'
  | 'default-minimalism-medium'
  | 'default-minimalism-small'
  | 'dark-large'
  | 'dark-medium'
  | 'dark-small'
  | 'dark-minimalism-large'
  | 'dark-minimalism-medium'
  | 'dark-minimalism-small'
  | string;

export const isSystemTheme = (name: ThemeName) => {
  const values = Object.values(DefaultThemeName);
  return values.includes(name as any);
};
