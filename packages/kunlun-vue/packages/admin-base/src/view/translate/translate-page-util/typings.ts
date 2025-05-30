export type TranslateManageItem = {
  id: string;
  lang: { name: string; code: string };
  module: string;
  moduleDefinition: {
    displayName: string;
    module: string;
    id: string;
  };
  origin: string;
  target?: string;
  resLang: { name: string; code: string };
  scope: string;
  state: boolean;
  /**
   * 提交时是否通过校验
   * 前端专用字段
   */
  validator?: boolean;
};

export enum TranslateScopeValue {
  module = 'MODULE',
  global = 'GLOBAL'
}

export type TranslateScope = {
  value: TranslateScopeValue;
  displayName: string;
  help: string;
};

export enum TranslateMode {
  ADD = 'ADD',
  UPDATE = 'UPDATE'
}

export type SearchCommonParams = {
  moduleName: string;
  model: string;
  action: string;
  langCode: string;
};
