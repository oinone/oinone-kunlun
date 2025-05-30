import { DslDefinition, DslDefinitionHelper } from '@kunlun/dsl';
import { IDslNode, RuntimeConfig } from '@kunlun/meta';
import { GenericReturnType, GenericType, StandardString } from '@kunlun/shared';
import { getSystemMajorConfig } from '../provider/major';
import { getI18nStatus } from '../provider/provider';
import { CurrentLanguage } from '../user';
import localeType from './locale/type';
import zhCN from './locale/zh_CN';

enum LanguageType {
  'zh-CN' = 'zh-CN',
  'en-US' = 'en-US'
}

interface IExtension extends Window {
  __language: localeType;
  __lang: LanguageType;
}

Reflect.set(window, '__language', {});
Reflect.set(window, '__lang', 'zh-CN');

function getLanguage() {
  return (window as unknown as IExtension).__language;
}

function setLanguage(language) {
  (window as unknown as IExtension).__language = {
    ...getLanguage(),
    ...language
  };
}

function getLang() {
  return (window as unknown as IExtension).__lang;
}

function setLang(l: LanguageType) {
  (window as unknown as IExtension).__lang = l;
}

const remoteI18nCache: Map<{ module: string; lang: string }, Record<string, unknown>> = new Map();

export const useLanguage = async (name: LanguageType) => {
  const language = zhCN;
  setLanguage(language);
  setLang(name);
};

const lang = localStorage.getItem('language') || ('zh-CN' as any);
useLanguage(lang);

/**
 * 注册语言 registryLanguage
 *
 * @param {LanguageType} type 语言的类型
 * @param {L} language 语言的数据
 *
 * @example
 *
 * 在项目中的main.ts文件
 *
 * import { registryLanguage, LanguageType, .... } from '@kunlun/vue';
 * import { CustomLanguageZH, CustomLanguageEN } from './customLanguage'
 *
 * CustomLanguageZH -> {demo: {field: '这是字段'}}
 * CustomLanguageEN -> {demo: {field: 'this is field'}}
 *
 * ... Original code
 *
 * registerProviders().then(() => {
 *  registryLanguage(LanguageType['zh-CN'], CustomLanguageZH); // 中文
 *  registryLanguage(LanguageType['en-US'], CustomLanguageEN); // 英文
 *
 *  ... Original code
 * })
 *
 * ... Original code
 *
 * 那么在widget文件可以通过 this.translate('demo.field') 获取对应的值
 * 如果是在vue文件，可以通过 props.translate('demo.field') 获取对应的值, 前置条件是这个vue文件必须在widget中的组件
 */
export const registryLanguage = <L extends Record<string, any>>(type: LanguageType, language: L) => {
  if (getLang() === type) {
    setLanguage(language);
  }
};

export const translate = (key: string) => {
  const path = key.split('.');
  let last: localeType = (window as unknown as IExtension).__language;
  for (let index = 0; index < path.length; index++) {
    if (!last) {
      return undefined;
    }
    last = last[path[index]] as localeType;
  }
  if (typeof last === 'string') {
    return translateValueByKey(last);
  }
  return translateValueByKey(key);
};

Reflect.set(window, 'translate', translate);

let currentModuleName = '';

const globalModuleName = 'global';
const globalModuleNameMapCommon = 'common';

const getI18nCache = (_lang: string) => {
  let cache: Record<string, unknown> | null = null;
  let globalCache: Record<string, unknown> | null = null;
  remoteI18nCache.forEach((value, key) => {
    if (key.module === currentModuleName && key.lang === _lang) {
      cache = value;
    }
    if (key.module === globalModuleName && key.lang === _lang) {
      globalCache = value;
    }
  });
  if (!cache && !globalCache) {
    return null;
  }
  const cacheProxy = {};
  return new Proxy(cacheProxy, {
    get(_, prop: string) {
      return cache?.[prop] ?? globalCache?.[prop] ?? prop;
    }
  });
};

const I18N_RESOLVE = 'i18nResolve';

const loadI18nFile = async (moduleName, isoStorageKey) => {
  return new Promise((resolve, reject) => {
    const runtimeConfig = RuntimeConfig.get();
    const langCode = CurrentLanguage.getIsoCodeByLocalStorage(isoStorageKey);
    if (langCode === CurrentLanguage.DEFAULT_LANGUAGE) {
      reject();
      return;
    }

    const defaultSrc = `${
      runtimeConfig.I18N_OSS_URL || process.env.I18N_OSS_URL || ''
    }/translate/${moduleName}/i18n_${langCode}.js`;

    const resourceTranslations = getSystemMajorConfig().extend?.resourceTranslations || [];
    const targetModuleName = moduleName === globalModuleName ? globalModuleNameMapCommon : moduleName;
    const existing = resourceTranslations.find((item) => item.moduleName === targetModuleName);
    const src = existing ? existing.remoteUrl || defaultSrc : defaultSrc;

    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const loadI18nResolve = async (modules: string[], isoStorageKey: string) => {
  const results: Record<string, unknown>[] = [];
  const successModuleList: string[] = [];
  const saveData = (data: Record<string, unknown>) => {
    results.push(data);
  };
  if (!Reflect.has(window, I18N_RESOLVE)) {
    Reflect.set(window, I18N_RESOLVE, (obj: Record<string, unknown>) => {
      saveData(obj);
    });
  }
  await Promise.all(
    modules.map(async (module) => {
      try {
        await loadI18nFile(module, isoStorageKey);
        successModuleList.push(module);
      } catch (e) {
        // console.error('loadI18nFile Failed!', e);
      }
    })
  );
  successModuleList.forEach((module, index) => {
    remoteI18nCache.set({ module, lang: getLang() }, results[index]);
  });
  Reflect.deleteProperty(window, I18N_RESOLVE);
};

const initI18n = async (module: string, isoStorageKey = '') => {
  if (Reflect.get(window, 'i18nResolve') && currentModuleName === module) {
    return;
  }
  currentModuleName = module;
  const i18nModuleList = [globalModuleName, module];
  await loadI18nResolve(i18nModuleList, isoStorageKey);
};

const whiteTranslateList = ['false', 'true'];

const fieldTranslateList = ['label', 'displayName', 'hint', 'placeholder', 'confirm', 'enterText', 'cancelText'];

/**
 * 将dsl配置信息，进行翻译
 *
 * @param {node} IDslNode dslNode
 */
export const translateNode = (node: IDslNode) => {
  const { __lang } = window as unknown as IExtension;
  const cache = getI18nCache(__lang) as Record<string, unknown>;
  if (cache && node) {
    Object.keys(node).forEach((key) => {
      const value = node[key];
      if (typeof value === 'string' && !whiteTranslateList.includes(value)) {
        node[key] = cache[node[key] as string] || node[key];
      }
    });

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((c) => translateNode(c));
    }
  }
};

/**
 * 将dsl配置信息，进行翻译
 *
 * @param dsl dsl定义
 */
export const translateDslDefinition = (dsl: DslDefinition, isFieldOrActionProp = false) => {
  if (!getI18nStatus()) {
    return dsl;
  }

  const { __lang } = window as unknown as IExtension;
  const cache = getI18nCache(__lang) as Record<string, unknown>;
  const isFieldOrAction =
    isFieldOrActionProp || DslDefinitionHelper.isAction(dsl) || DslDefinitionHelper.isField(dsl) || false;
  if (cache && dsl) {
    Object.keys(dsl).forEach((key) => {
      if (isFieldOrAction && !fieldTranslateList.includes(key)) {
        return;
      }
      const value = dsl[key];
      if (typeof value === 'string' && !whiteTranslateList.includes(value)) {
        dsl[key] = cache[dsl[key] as string] || dsl[key];
      }
    });
    dsl.widgets?.forEach((v) => translateDslDefinition(v, isFieldOrAction));
    const { options } = dsl;
    if (options && Array.isArray(options)) {
      options?.forEach((v) => translateDslDefinition(v, isFieldOrAction));
    }
  }
};

/**
 * 根据key获取对应的value，用于获取远程脚本中的配置
 *
 * @example
 *  const action = {displayName: "批量禁用", ....}
 *  translateValueByKey(action.displayName)
 *
 */

export const translateValueByKey = <T extends StandardString>(key: GenericType<T>): GenericReturnType<T, string> => {
  if (!key || !getI18nStatus()) {
    return key as unknown as GenericReturnType<T, string>;
  }

  const { __lang } = window as any as IExtension;
  const cache = getI18nCache(__lang) as Record<string, any>;

  if (cache) {
    return cache[key as string] || key;
  }

  return key as unknown as GenericReturnType<T, string>;
};

export const formateLanguage = (language?: string) => {
  if (!language) {
    return '';
  }
  return language.replace('_', '-').toLowerCase();
};

export { remoteI18nCache, initI18n, getI18nCache, LanguageType };
