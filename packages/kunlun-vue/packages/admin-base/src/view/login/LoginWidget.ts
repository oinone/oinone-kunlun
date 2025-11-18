import { BASIC_CONFIG_KEY, OINONE_HOMEPAGE_KEY, translateValueByKey } from '@oinone/kunlun-engine';
import { SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import {
  gql,
  HttpClientError,
  ILevel,
  isFirstResetPasswordError,
  isPicCodeError,
  useMessageHub
} from '@oinone/kunlun-request';
import { http } from '@oinone/kunlun-service';
import { SPI } from '@oinone/kunlun-spi';
import { RouterWidget } from '@oinone/kunlun-vue-router';
import { OioNotification } from '@oinone/kunlun-vue-ui-antd';
import { loginMessageHubName, LoginMode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { encrypt, homepageMaybeRuntimeContext } from '../../util';
import { BaseLoginWidget } from './BaseLoginWidget';
import LoginComponent from './Login.vue';

@SPI.ClassFactory(
  RouterWidget.Token({
    widget: 'Login'
  })
)
export class LoginWidget extends BaseLoginWidget {
  protected moduleName = SYSTEM_MODULE_NAME.USER;

  @Widget.Method()
  protected handleRegister() {
    console.error('you should to overwrite function `handleRegister` in LoginPageWidget if you want register working');
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
  protected year: string = new Date().getFullYear().toString();

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
  private buttonContent = translateValueByKey('获取验证码');

  @Widget.Reactive()
  protected canClick = true;

  @Widget.Reactive()
  protected graphCode = '';

  public initialize(config: Record<string, unknown> = {}) {
    super.initialize(config);

    this.setComponent(LoginComponent);

    return this;
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
  protected async getPicCode(message = this.errorMessages.verificationCodeEmpty) {
    const result = await this.picCode();
    this.graphCode = result;
    this.error.picCode = translateValueByKey(message);
  }

  // 发送短信验证码
  @Widget.Method()
  protected async getCode() {
    switch (this.loginMode) {
      case LoginMode.CODE:
        this.getPhoneCode();
        break;
      case LoginMode.EMAIL:
        this.getEmailCode();
        break;
    }
  }

  protected async getPhoneCode() {
    if (!this.authForm.phone) {
      this.error.phone = translateValueByKey(this.errorMessages.phoneEmpty);
      return false;
    }

    try {
      const result = (await this.getUserMutation('loginVerificationCode', {
        phone: this.authForm.phone,
        inviteCode: this.selectCountry
      })) as any;
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

  protected async getEmailCode() {
    if (!this.authForm.email) {
      this.error.email = translateValueByKey(this.errorMessages.emailEmpty);
      return false;
    }

    try {
      const result = (await this.getUserMutation('sendEmailVerificationCodeForLogin', {
        userBehaviorEvent: 'SEND_LOGIN_BY_EMAIL_CODE',
        email: this.authForm.email
      })) as any;
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
    this.buttonContent = `${totalTime}${translateValueByKey('秒后重新发送')}`;
    const clock = window.setInterval(() => {
      totalTime--;
      this.buttonContent = `${totalTime}${translateValueByKey('秒后重新发送')}`;
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
    this.watchError();

    try {
      const model = this.constructModel(data);
      const queryGql = gql`mutation{
        pamirsUserTransientMutation {
          ${mutation}(user:{
            ${model}
          }){
            redirect {
              id
            }
            broken
            errorMsg
            errorCode
            errorField
          }
        }
      }`;

      const result = await http.mutate(SYSTEM_MODULE_NAME.USER, queryGql, {
        lang: this.currentLanguage.code
      });
      return (result as any).data.pamirsUserTransientMutation[mutation];
    } catch (error) {
      const errors = (error as HttpClientError)?.errors;
      if (errors && errors.length > 0) {
        errors.forEach((e) => {
          OioNotification.error(translateValueByKey('失败'), e.message);
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
      } else if (key === 'userBehaviorEvent') {
        s += `${key}: ${dict[key]}
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
    this.selectCountry = val;
  }

  @Widget.Method()
  public async login() {
    const rst = await this.beforeClick();
    if (!rst) {
      return;
    }

    const { login, password, phone, verificationCode, picCode, email, emailCode } = this.authForm;
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

      // 用户名密码登录
      await this.executeResult(
        await this.getUserMutation('login', { login, password: encrypt(password), picCode }),
        true
      );
    } else if (this.isCode) {
      if (!phone || !verificationCode) {
        this.error.phone = phone ? '' : translateValueByKey(this.errorMessages.phoneEmpty);
        this.error.verificationCode = verificationCode
          ? ''
          : translateValueByKey(this.errorMessages.verificationCodeEmpty);

        return;
      }

      // TODO 升级5.1.x的时候inviteCode改成 phoneCode
      // 验证码登录
      await this.executeResult(
        await this.getUserMutation('loginByVerificationCode', {
          phone,
          verificationCode,
          inviteCode: this.selectCountry
        })
      );
    } else {
      if (!email || !emailCode) {
        this.error.email = email ? '' : translateValueByKey(this.errorMessages.emailEmpty);
        this.error.emailCode = emailCode ? '' : translateValueByKey(this.errorMessages.verificationCodeEmpty);
        return;
      }
      await this.executeResult(
        await this.getUserMutation('loginByVerificationCode', {
          userBehaviorEvent: 'LOGIN_BY_EMAIL_CODE',
          email,
          verificationCode: emailCode
        })
      );
    }
  }

  /**
   * 登录接口调用后调
   * @param result { errorField, errorMsg, redirect, broken, errorCode }
   * @param isByLogin
   * @protected
   */
  protected async executeResult(result, isByLogin = false) {
    const rst = this.afterClick(result);

    if (!rst) {
      return;
    }

    const { errorField, errorMsg, redirect, broken, errorCode } = result;

    if (broken) {
      if (isByLogin && errorField === 'phone') {
        this.error.login = translateValueByKey(errorMsg as string | undefined);
      } else {
        this.error[errorField] = translateValueByKey(errorMsg);
      }

      if (errorField === 'picCode') {
        this.getPicCode(errorMsg);
        return;
      }

      if (isFirstResetPasswordError(errorCode)) {
        // 首次登录需修改密码
        this.router.push({ segments: [{ path: 'first' }] });
        return;
      }

      if (this.graphCode) {
        this.getPicCode(translateValueByKey(this.errorMessages.inputVerificationCodeAlign));
      }
    } else if (redirect) {
      // 项目目录network-interceptor.ts拼入的redirect_url
      const redirect_url = window.location.search.split('?redirect_url=')[1];
      if (redirect_url) {
        window.location.href = redirect_url;
      } else {
        const parameters = (await homepageMaybeRuntimeContext(undefined, true)) as any;
        localStorage.setItem(OINONE_HOMEPAGE_KEY, JSON.stringify(parameters));

        this.router.push({
          segments: [
            {
              path: 'page',
              parameters
            }
          ]
        });
      }
    }
  }

  public watchError() {
    const hub = useMessageHub(loginMessageHubName);
    hub.subscribe((error) => {
      const { errorCode } = error;
      if (isPicCodeError(errorCode)) {
        this.getPicCode();
      }
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
}

/**
 * @deprecated please using LoginWidget
 */
export const LoginPageWidget = LoginWidget;
