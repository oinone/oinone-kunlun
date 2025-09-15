export type ThemeType = 'default' | 'dark';

export type ThemeSize = 'large' | 'medium' | 'small';

export interface DefaultSideBarTheme {
  mode?: ThemeType;
}

export enum DefaultThemeName {
  DEFAULT_LARGE = 'default-large',
  DEFAULT_MEDIUM = 'default-medium',
  DEFAULT_SMALL = 'default-small',

  DEFAULT_COMPACT_LARGE = 'default-compact-large',
  DEFAULT_COMPACT_MEDIUM = 'default-compact-medium',
  DEFAULT_COMPACT_SMALL = 'default-compact-small',

  DARK_LARGE = 'dark-large',
  DARK_MEDIUM = 'dark-medium',
  DARK_SMALL = 'dark-small',

  DARK_COMPACT_LARGE = 'dark-compact-large',
  DARK_COMPACT_MEDIUM = 'dark-compact-medium',
  DARK_COMPACT_SMALL = 'dark-compact-small'
}

export type ThemeName =
  | 'default-large'
  | 'default-medium'
  | 'default-small'
  | 'default-compact-large'
  | 'default-compact-medium'
  | 'default-compact-small'
  | 'dark-large'
  | 'dark-medium'
  | 'dark-small'
  | 'dark-compact-large'
  | 'dark-compact-medium'
  | 'dark-compact-small'
  | string;

export const isSystemTheme = (name: ThemeName) => {
  const values = Object.values(DefaultThemeName);
  return values.includes(name as any);
};
