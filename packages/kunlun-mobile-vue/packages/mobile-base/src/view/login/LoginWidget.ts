import {
  BASIC_CONFIG_KEY,
  ConfigHelper,
  CurrentLanguage,
  getLoginTheme,
  MajorConfig,
  OINONE_HOMEPAGE_KEY,
  OioProvider,
  systemMajorConfig,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { isEmptyKeObject, MetadataFragment, RuntimeConfig, SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import {
  gql,
  HttpClient,
  HttpClientError,
  IErrorMessage,
  ILevel,
  SystemErrorCode,
  useMessageHub
} from '@oinone/kunlun-request';
import { Router } from '@oinone/kunlun-router';
import { http } from '@oinone/kunlun-service';
import { SPI } from '@oinone/kunlun-spi';
import { RouterWidget, useRouter } from '@oinone/kunlun-vue-router';
import { defaultLoginErrorMessages, EN_US_CODE, RuntimeLanguage } from '@oinone/kunlun-vue-ui-common';
import { OioNotification } from '@oinone/kunlun-vue-ui-mobile-vant';
import { VueWidget, Widget } from '@oinone/kunlun-vue-widget';
import { BaseI18nRouterWidget } from '../../basic';
import { encrypt, homepageMaybeRuntimeContext } from '../../util';
import LoginComponent from './Login.vue';
import {
  defaultLoginPageSettings,
  LOGIN_LANGUAGE_ISO_STORAGE_KEY,
  LOGIN_LANGUAGE_STORAGE_KEY,
  LoginConfig,
  LoginData,
  loginMessageHubName,
  LoginMode
} from './types';

@SPI.ClassFactory(RouterWidget.Token({ widget: 'MobileLogin' }))
export class LoginPageWidget extends BaseI18nRouterWidget {
  public errorMessages = defaultLoginErrorMessages;

  @Widget.Reactive()
  protected get copyrightYear(): string {
    return new Date().getFullYear().toString();
  }

  @Widget.Reactive()
  protected get currentLoginTheme() {
    return getLoginTheme();
  }

  protected getLoginConfig(): LoginConfig {
    return ConfigHelper.getConfig(RuntimeConfig.getConfig('login'));
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

  @Widget.Method()
  protected handleRegister() {
    console.error('you should to overwrite function `handleRegister` in LoginPageWidget if you want register working');
  }

  /**
   * 用来处理点击「登录」之前的事件，可以做二次确定或者其他的逻辑
   * 只有return true，才会继续往下执行
   */
  public async beforeClick(): Promise<Boolean | null | undefined> {
    return true;
  }

  /**
   *
   * @param result 后端接口返回的数据
   *
   * 用来处理「登录」接口调用后的逻辑，可以修改后端返回的错误文案
   *
   * 只有return true，才会执行默认的跳转事件
   */
  public async afterClick(result?): Promise<any | null | undefined> {
    return true;
  }

  @Widget.Reactive()
  protected _systemMajorConfig: MajorConfig | undefined;

  @Widget.Reactive()
  protected get systemMajorConfig() {
    return this._systemMajorConfig || (systemMajorConfig as MajorConfig);
  }

  @Widget.Reactive()
  protected authForm = {
    login: '',
    password: '',
    phone: '',
    verificationCode: '',
    picCode: ''
  };

  protected router!: Router;

  @Widget.Reactive()
  protected countryList: any[] = [];

  @Widget.Reactive()
  protected selectCountry = '+86';

  @Widget.Reactive()
  protected loginMode: LoginMode = LoginMode.ACCOUNT;

  @Widget.Reactive()
  protected get loginModeTitle() {
    const LoginModeTitle = {
      [LoginMode.ACCOUNT]: this.accountLoginLabel,
      [LoginMode.CODE]: this.codeLoginLabel,
      [LoginMode.EMAIL]: this.emailLoginLabel
    };
    return LoginModeTitle[this.loginMode];
  }

  @Widget.Reactive()
  protected get isAccount() {
    return this.loginMode === LoginMode.ACCOUNT;
  }

  @Widget.Reactive()
  protected get isCode() {
    return this.loginMode === LoginMode.CODE;
  }

  @Widget.Reactive()
  protected get isEmail() {
    return this.loginMode === LoginMode.EMAIL;
  }

  @Widget.Reactive()
  protected buttonContent = translateValueByKey('获取验证码');

  @Widget.Reactive()
  protected canClick = true;

  @Widget.Reactive()
  protected graphCode = '';

  @Widget.Reactive()
  protected error: LoginData = {};

  @Widget.Reactive()
  protected languages: RuntimeLanguage[] = [];

  @Widget.Reactive()
  protected currentLanguage: RuntimeLanguage = {} as RuntimeLanguage;

  public initialize(config: Record<string, unknown> = {}) {
    super.initialize(config);

    this.setComponent(LoginComponent);

    return this;
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

  @Widget.Reactive()
  protected validation = {
    status: '',
    message: ''
  };

  @Widget.Watch('authForm.login')
  protected async onResetPicCode() {
    this.graphCode = '';
  }

  @Widget.Watch('loginMode')
  protected async watchSwitch(mode) {
    if (mode === LoginMode.CODE && !this.countryList.length) {
      this.countryList = (await this.queryCountryList()) as any[];
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

  @Widget.Method()
  protected async getPicCode(message = this.errorMessages.verificationCodeEmpty) {
    const result = await this.picCode();
    this.graphCode = result;
    this.error.picCode = translateValueByKey(message);
  }

  @Widget.Method()
  protected async getCode() {
    if (!this.authForm.phone) {
      this.error.phone = translateValueByKey(this.errorMessages.phoneEmpty);

      return false;
    }

    try {
      const result = (await this.getUserMutation('loginVerificationCode', { phone: this.authForm.phone })) as any;
      const { errorCode, errorField, errorMsg } = result;
      if (errorCode !== 0) {
        this.error[errorField] = errorMsg;
      } else {
        this.countDown();
      }
    } catch (error) {
      //
    }
  }

  protected countDown() {
    if (!this.canClick) {
      return;
    }

    this.canClick = false;
    let totalTime = 60;
    this.buttonContent = `${totalTime} ${translateValueByKey('秒后重新发送')}`;
    const clock = window.setInterval(() => {
      totalTime--;
      this.buttonContent = `${totalTime} ${translateValueByKey('秒后重新发送')}`;
      if (totalTime < 0) {
        window.clearInterval(clock);
        this.buttonContent = translateValueByKey('重新发送');
        this.canClick = true;
      }
    }, 1000);
  }

  @Widget.Method()
  protected async picCode() {
    const { login, phone } = this.authForm;
    const l = this.isAccount ? login : phone;

    const imagePath = '/pamirs/api/refreshPicCode';
    return `${http.getBaseURL()}${imagePath}?time=${Date.now()}&picCodeScene=login_pic_code&login=${l}`;
  }

  protected async queryCountryList() {
    const queryGql = `
      {
        resourceCountryQuery {
          queryPhoneCodes {
            id
            name
            phoneCode
          }
        }
      }
    `;
    const result = await http.query<any[]>(SYSTEM_MODULE_NAME.RESOURCE, queryGql, {
      lang: this.currentLanguage.code
    });
    return result.data.resourceCountryQuery.queryPhoneCodes;
  }

  protected async getUserMutation(mutation: string, data) {
    this.watchPicCodeError();

    try {
      const model = this.constructModel(data);
      const queryGql = gql`mutation{
        pamirsUserTransientMutation {
          ${mutation}(user:{
            ${model}
          }){
            redirect {
              ...ViewAction
            }
            broken
            errorMsg
            errorCode
            errorField
          }
        }
      }
    ${MetadataFragment.ViewAction}`;

      return this.validateUnauthorized(async () => {
        const result = await HttpClient.getInstance().mutate(SYSTEM_MODULE_NAME.USER, queryGql, {
          lang: this.currentLanguage.code
        });
        return (result as any).data.pamirsUserTransientMutation[mutation];
      });
    } catch (error) {
      const errors = (error as HttpClientError)?.errors;
      if (errors && errors.length > 0) {
        errors.forEach((e) => {
          OioNotification.error('失败', e.message);
        });
      }
    }
  }

  protected constructModel(dict) {
    let s = '';
    for (const key in dict) {
      if (typeof dict[key] === 'object') {
        s += `
    ${key}: {${this.constructModel(dict[key])}}
    `;
      } else {
        s += `${key}: "${dict[key]}"
    `;
      }
    }
    return s;
  }

  @Widget.Method()
  protected searchMethod(keyword, option) {
    return option.children[0].children.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
  }

  @Widget.Method()
  protected handleCountryChange(val) {
    this.selectCountry = val.value;
  }

  @Widget.Method()
  public async login() {
    const rst = await this.beforeClick();
    if (!rst) {
      return;
    }

    const { login, password, phone, verificationCode, picCode } = this.authForm;
    if (this.isAccount) {
      if (!login || !password) {
        this.error.login = login ? '' : translateValueByKey(this.errorMessages.loginEmpty);
        this.error.password = password ? '' : translateValueByKey(this.errorMessages.passwordEmpty);

        return;
      }

      if (this.graphCode) {
        this.error.picCode = picCode ? '' : translateValueByKey(this.errorMessages.verificationCodeEmpty);

        if (this.error.picCode) {
          return;
        }
      }

      await this.executeResult(
        await this.getUserMutation('login', { login, password: encrypt(password), picCode }),
        true
      );
    } else {
      if (!phone || !verificationCode) {
        this.error.phone = phone ? '' : translateValueByKey(this.errorMessages.phoneEmpty);
        this.error.verificationCode = verificationCode
          ? ''
          : translateValueByKey(this.errorMessages.verificationCodeEmpty);
        return;
      }

      await this.executeResult(await this.getUserMutation('loginByVerificationCode', { phone, verificationCode }));
    }
  }

  protected async validateUnauthorized(predicate) {
    try {
      return await predicate();
    } catch (e) {
      if (e instanceof HttpClientError) {
        const errors = (e.errors || []) as IErrorMessage[];
        const $errorCode = errors[0]?.extensions?.errorCode as any;
        const notPermissionCodes = [
          SystemErrorCode.NO_PERMISSION_ON_MODULE,
          SystemErrorCode.NO_PERMISSION_ON_VIEW,
          SystemErrorCode.NO_PERMISSION_ON_HOMEPAGE,
          SystemErrorCode.NO_PERMISSION_ON_MODULE_ENTRY
        ];

        if (notPermissionCodes.includes($errorCode)) {
          this.router.push({
            segments: [
              {
                path: 'unauthorized'
              }
            ]
          });
        }
      }
    }
  }

  protected async executeResult(result, isByLogin = false) {
    const rst = this.afterClick(result);

    if (!rst) {
      return;
    }

    const { errorField, errorMsg, redirect, broken, errorCode } = result;

    if (broken) {
      if (isByLogin && errorField === 'phone') {
        this.error.login = errorMsg;
      } else {
        this.error[errorField] = errorMsg;
      }

      if (errorField === 'picCode') {
        this.getPicCode(errorMsg);
      }

      if (['20200008', '20060008', 20060008].includes(errorCode)) {
        // 首次登录需修改密码
        this.router.push({ segments: [{ path: 'first' }] });
      }
    } else if (redirect) {
      // 项目目录network-interceptor.ts拼入的redirect_url
      localStorage.setItem(OINONE_HOMEPAGE_KEY, JSON.stringify(redirect));
      const redirect_url = location.search.split('?redirect_url=')[1];
      if (redirect_url) {
        location.href = redirect_url;
      } else {
        this.validateUnauthorized(async () => {
          const parameters = await homepageMaybeRuntimeContext();
          this.router.push({
            segments: [
              {
                path: 'page',
                parameters
              }
            ]
          });
        });
      }
    }
  }

  public watchPicCodeError() {
    const hub = useMessageHub(loginMessageHubName);
    hub.subscribe((error) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      error.errorCode === '20060080' && this.getPicCode();
      hub.unsubscribe();
    }, ILevel.ERROR);
  }

  @Widget.Method()
  protected setLoginMode(mode: LoginMode) {
    this.loginMode = mode;
    this.error = {};
    this.graphCode = '';
  }

  @Widget.Method()
  protected gotoForget() {
    this.router.push({ segments: [{ path: 'forget' }] });
  }

  @Widget.Method()
  protected clearErrorMessage() {
    this.error = {};
  }

  protected beforeCreated() {
    sessionStorage.removeItem(BASIC_CONFIG_KEY);
    this.router = useRouter().router;
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
    const result = await http.mutate('base', mutation, { lang: langCode, translationOnlyGlobal: true });
    return result.data['appConfigQuery']['queryListByWrapper'];
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

  protected async mounted() {
    if (isEmptyKeObject(systemMajorConfig)) {
      this._systemMajorConfig = await OioProvider.refreshSystemMajorConfig();
    }
    super.mounted();
  }
}
