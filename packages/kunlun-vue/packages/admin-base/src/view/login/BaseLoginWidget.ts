import {
  BASIC_CONFIG_KEY,
  ConfigHelper,
  CurrentLanguage,
  getLoginTheme,
  MajorConfig,
  OioProvider,
  systemMajorConfig
} from '@oinone/kunlun-engine';
import { RuntimeConfig, SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { gql } from '@oinone/kunlun-request';
import { Matched, Router, useMatched } from '@oinone/kunlun-router';
import { http } from '@oinone/kunlun-service';
import { useRouter } from '@oinone/kunlun-vue-router';
import {
  defaultLoginErrorMessages,
  defaultLoginPageSettings,
  EN_US_CODE,
  LOGIN_LANGUAGE_ISO_STORAGE_KEY,
  LOGIN_LANGUAGE_STORAGE_KEY,
  LoginConfig,
  LoginData,
  RuntimeLanguage
} from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseI18nRouterWidget } from '../../basic';

export class BaseLoginWidget extends BaseI18nRouterWidget {
  protected matched: Matched | undefined;

  protected router!: Router;

  public errorMessages = defaultLoginErrorMessages;

  protected getLoginConfig(): LoginConfig {
    return ConfigHelper.getConfig(RuntimeConfig.getConfig('login'));
  }

  @Widget.Reactive()
  protected authForm = {
    login: '',
    password: '',
    phone: '',
    verificationCode: '',
    picCode: '',
    email: '',
    emailCode: ''
  };

  @Widget.Reactive()
  protected error: LoginData = {};

  @Widget.Method()
  protected clearErrorMessage() {
    this.error = {};
  }

  @Widget.Reactive()
  protected get systemMajorConfig(): MajorConfig {
    return systemMajorConfig;
  }

  @Widget.Reactive()
  protected get loginLabel(): string {
    return this.getLoginConfig()?.loginLabel ?? defaultLoginPageSettings.loginLabel;
  }

  @Widget.Reactive()
  protected get forgetPassword(): boolean {
    return !!(this.getLoginConfig()?.forgetPassword ?? defaultLoginPageSettings.forgetPassword);
  }

  @Widget.Reactive()
  protected get forgetPasswordLabel(): string {
    return this.getLoginConfig()?.forgetPasswordLabel ?? defaultLoginPageSettings.forgetPasswordLabel;
  }

  @Widget.Reactive()
  protected get register(): boolean {
    return !!(this.getLoginConfig()?.register ?? defaultLoginPageSettings.register);
  }

  @Widget.Reactive()
  protected get codeLogin(): boolean {
    return !!(this.getLoginConfig()?.codeLogin ?? defaultLoginPageSettings.codeLogin);
  }

  @Widget.Reactive()
  protected get accountLoginLabel(): string {
    return this.getLoginConfig()?.accountLoginLabel ?? defaultLoginPageSettings.accountLoginLabel;
  }

  @Widget.Reactive()
  protected get codeLoginLabel(): string {
    return this.getLoginConfig()?.codeLoginLabel ?? defaultLoginPageSettings.codeLoginLabel;
  }

  @Widget.Reactive()
  protected get registerLabel(): string {
    return this.getLoginConfig()?.registerLabel ?? defaultLoginPageSettings.registerLabel;
  }

  @Widget.Reactive()
  protected get accountPlaceholder(): string {
    return this.getLoginConfig()?.accountPlaceholder ?? defaultLoginPageSettings.accountPlaceholder;
  }

  @Widget.Reactive()
  protected get passwordPlaceholder(): string {
    return this.getLoginConfig()?.passwordPlaceholder ?? defaultLoginPageSettings.passwordPlaceholder;
  }

  @Widget.Reactive()
  protected get phonePlaceholder(): string {
    return this.getLoginConfig()?.phonePlaceholder ?? defaultLoginPageSettings.phonePlaceholder;
  }

  @Widget.Reactive()
  protected get codePlaceholder(): string {
    return this.getLoginConfig()?.codePlaceholder ?? defaultLoginPageSettings.codePlaceholder;
  }

  @Widget.Reactive()
  protected get email(): boolean {
    return this.getLoginConfig()?.email ?? defaultLoginPageSettings.email;
  }

  @Widget.Reactive()
  protected get emailLoginLabel(): string {
    return this.getLoginConfig()?.emailLoginLabel ?? defaultLoginPageSettings.emailLoginLabel;
  }

  @Widget.Reactive()
  protected get emailPlaceholder(): string {
    return this.getLoginConfig()?.emailPlaceholder ?? defaultLoginPageSettings.emailPlaceholder;
  }

  @Widget.Reactive()
  protected get emailCodePlaceholder(): string {
    return this.getLoginConfig()?.emailCodePlaceholder ?? defaultLoginPageSettings.emailCodePlaceholder;
  }

  @Widget.Reactive()
  protected get currentLoginTheme() {
    return getLoginTheme();
  }

  @Widget.Reactive()
  protected get copyrightYear(): string {
    return new Date().getFullYear().toString();
  }

  @Widget.Reactive()
  protected get enableI18n(): boolean | undefined {
    return OioProvider.getConfig().enableI18n;
  }

  @Widget.Reactive()
  protected languages: RuntimeLanguage[] = [];

  @Widget.Reactive()
  protected currentLanguage: RuntimeLanguage = {} as RuntimeLanguage;

  protected async getCurrentLanguage() {
    return localStorage.getItem(LOGIN_LANGUAGE_STORAGE_KEY) ?? CurrentLanguage.DEFAULT_LANGUAGE;
  }

  protected async getCurrentLanguageIsoCode() {
    return localStorage.getItem(LOGIN_LANGUAGE_ISO_STORAGE_KEY);
  }

  protected async setCurrentLanguage(language: RuntimeLanguage) {
    localStorage.setItem(LOGIN_LANGUAGE_STORAGE_KEY, language.code);
    localStorage.setItem(LOGIN_LANGUAGE_ISO_STORAGE_KEY, language.isoCode);
  }

  protected initCurrentLanguage(code: string) {
    Reflect.set(window, '__lang', code);
    if (!this.currentLanguage || this.currentLanguage?.code !== code) {
      const language = this.languages!.find((v) => v.code === code);
      if (language) {
        this.currentLanguage = language;
      }
    }
  }

  protected async queryLanguageSetting(langCode) {
    const mutation = `
      {
        appConfigQuery {
          queryListByWrapper(queryWrapper: { rsql: "1==1 and scope==GLOBAL" }) {
            extend
          }
        }
      }
    `;
    const result = await http.mutate(SYSTEM_MODULE_NAME.BASE, mutation, {
      lang: langCode,
      translationOnlyGlobal: true
    });
    return result.data.appConfigQuery.queryListByWrapper;
  }

  protected async initLanguages(): Promise<void> {
    if (!this.languages?.length) {
      const languages = await this.queryLanguageList();
      this.languages = languages.map((v) => {
        if (!v.icon) {
          if (v.code === EN_US_CODE) {
            v.icon = 'oinone-yingguo';
          } else {
            v.icon = 'oinone-zhongguo';
          }
        }
        return v;
      });
    }
  }

  protected async queryLanguageList() {
    const body = gql`
      {
        resourceLangQuery {
          queryLoginLanguage {
            id
            name
            code
            isoCode
          }
        }
      }
    `;
    try {
      const res = await http.mutate<RuntimeLanguage[]>(SYSTEM_MODULE_NAME.RESOURCE, body, {
        lang: await this.getCurrentLanguage()
      });
      return res.data.resourceLangQuery.queryLoginLanguage;
    } catch (e) {
      console.error('error query language list.', e);
      return [];
    }
  }

  @Widget.Method()
  protected onLanguageChange(value: RuntimeLanguage) {
    if (!value || value.code === this.currentLanguage?.code) {
      return;
    }
    this.currentLanguage = value;
    this.setCurrentLanguage(value);
    window.location.reload();
  }

  /**
   * 用来处理点击「登录」之前的事件，可以做二次确定或者其他的逻辑
   * 只有return true，才会继续往下执行
   */
  public async beforeClick(): Promise<Boolean | null | undefined> {
    return true;
  }

  protected beforeCreated() {
    sessionStorage.removeItem(BASIC_CONFIG_KEY);
    const { matched } = useMatched();
    this.matched = matched;
    this.router = useRouter().router;
  }

  protected async beforeMount() {
    this.isoStorageKey = LOGIN_LANGUAGE_ISO_STORAGE_KEY;
    this.initLanguages().then(async () => {
      const language = await this.getCurrentLanguage();
      await this.queryLanguageSetting(language);
      this.initCurrentLanguage(language);
      super.beforeMount();
    });
  }
}
