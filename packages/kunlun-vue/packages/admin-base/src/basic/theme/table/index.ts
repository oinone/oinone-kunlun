import { THEME_CONFIG } from '@oinone/kunlun-theme';
import { TableThemeConfig } from './config';

export function getTableThemeConfig(): Partial<TableThemeConfig> | undefined {
  return THEME_CONFIG['table-config'];
}

export * from './config';
export * from './default';
