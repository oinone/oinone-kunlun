export const ZH_CN_CODE = 'zh-CN';

export const EN_US_CODE = 'en-US';

export interface RuntimeLanguage {
  id: string;
  name: string;
  active: boolean;
  code: string;
  isoCode: string;
  icon: string;
}

export interface LanguageUrlParameters {
  language: string;
}

export interface LanguageUrlParameterOptions {
  language?: string;
}
