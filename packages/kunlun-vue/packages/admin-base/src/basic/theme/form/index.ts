import { THEME_CONFIG } from '@oinone/kunlun-theme';
import { FormItemThemeConfig } from './config';

export function getFormItemThemeConfig(): Partial<FormItemThemeConfig> {
  return {
    readonlyShowPlaceholder: false,
    disabledShowPlaceholder: false,
    ...THEME_CONFIG['form-item-config']
  } as Partial<FormItemThemeConfig>;
}

export * from './config';
