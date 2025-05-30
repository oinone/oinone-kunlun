import { NonBlockingEventManager } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { UserLang } from '../typing';
import { LanguageService, LanguageServiceToken } from './LanguageService';

export enum CurrentLanguageEventKeys {
  refreshLocalStorage = 'refreshLocalStorage',
  refreshSessionStorage = 'refreshSessionStorage'
}

type RefreshLocalStorageFunction = (languageCode: string, languageIsoCode: string) => void;

type RefreshSessionStorageFunction = RefreshLocalStorageFunction;

export class CurrentLanguage {
  private static eventManager = new NonBlockingEventManager<typeof CurrentLanguageEventKeys>();

  private static languageService: LanguageService | undefined;

  public static LOCAL_STORAGE_CODE_KEY = 'language';

  public static LOCAL_STORAGE_ISO_CODE_KEY = 'languageIsoCode';

  public static readonly DEFAULT_LANGUAGE = 'zh-CN';

  public static async get(): Promise<UserLang | undefined> {
    if (!CurrentLanguage.languageService) {
      CurrentLanguage.languageService = SPI.RawInstantiate(LanguageServiceToken);
      if (!CurrentLanguage.languageService) {
        throw new Error('Invalid current language service.');
      }
    }
    return CurrentLanguage.languageService.get();
  }

  public static async getCode(): Promise<string> {
    const lang = await CurrentLanguage.get();
    return lang?.code || CurrentLanguage.DEFAULT_LANGUAGE;
  }

  public static async getIsoCode(): Promise<string> {
    const lang = await CurrentLanguage.get();
    return lang?.isoCode || CurrentLanguage.DEFAULT_LANGUAGE;
  }

  public static getCodeByLocalStorage(): string {
    return (
      sessionStorage.getItem(CurrentLanguage.LOCAL_STORAGE_CODE_KEY) ||
      localStorage.getItem(CurrentLanguage.LOCAL_STORAGE_CODE_KEY) ||
      CurrentLanguage.DEFAULT_LANGUAGE
    );
  }

  public static getIsoCodeByLocalStorage(key = ''): string {
    return (
      sessionStorage.getItem(key || CurrentLanguage.LOCAL_STORAGE_ISO_CODE_KEY) ||
      localStorage.getItem(key || CurrentLanguage.LOCAL_STORAGE_ISO_CODE_KEY) ||
      CurrentLanguage.DEFAULT_LANGUAGE
    );
  }

  public static async refreshLocalStorage(): Promise<void> {
    const code = await CurrentLanguage.getCode();
    const isoCode = await CurrentLanguage.getIsoCode();
    localStorage.setItem(CurrentLanguage.LOCAL_STORAGE_CODE_KEY, code);
    localStorage.setItem(CurrentLanguage.LOCAL_STORAGE_ISO_CODE_KEY, isoCode);
    CurrentLanguage.eventManager.notifyHandler('refreshLocalStorage', code, isoCode);
  }

  public static refreshSessionStorage(language: string, languageIsoCode: string): void {
    sessionStorage.setItem(CurrentLanguage.LOCAL_STORAGE_CODE_KEY, language);
    sessionStorage.setItem(CurrentLanguage.LOCAL_STORAGE_ISO_CODE_KEY, languageIsoCode);
    CurrentLanguage.eventManager.notifyHandler('refreshSessionStorage', language, languageIsoCode);
  }

  public static onRefreshLocalStorage(fn: RefreshLocalStorageFunction) {
    CurrentLanguage.eventManager.on('refreshLocalStorage', fn);
  }

  public static onRefreshSessionStorage(fn: RefreshSessionStorageFunction) {
    CurrentLanguage.eventManager.on('refreshSessionStorage', fn);
  }

  public static clearOnRefreshLocalStorage(fn: RefreshLocalStorageFunction) {
    CurrentLanguage.eventManager.clearOn('refreshLocalStorage', fn);
  }

  public static clearOnRefreshSessionStorage(fn: RefreshSessionStorageFunction) {
    CurrentLanguage.eventManager.clearOn('refreshSessionStorage', fn);
  }
}
