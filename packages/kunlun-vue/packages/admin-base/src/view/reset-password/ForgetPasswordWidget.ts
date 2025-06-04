import { getMajorConfig, MajorConfig, translateValueByKey } from '@oinone/kunlun-engine';
import { Router } from '@oinone/kunlun-router';
import { http } from '@oinone/kunlun-service';
import { SPI } from '@oinone/kunlun-spi';
import { RouterWidget, useRouter } from '@oinone/kunlun-vue-router';
import { FormItemRule, OioFormInstance, OioMessage } from '@oinone/kunlun-vue-ui-antd';
import { SelectItem } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { PhoneCodeQueryService, UserService } from '../../service';
import { ResourceCountry } from '../../typing';
import ForgetPassword from './ForgetPassword.vue';
import { ResetPasswordData } from './typing';
import { BaseI18nRouterWidget } from '../../basic/BaseI18nRouterWidget';
import { SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';

@SPI.ClassFactory(RouterWidget.Token({ widget: 'ForgetPassword' }))
export class ForgetPasswordWidget extends BaseI18nRouterWidget {
  protected moduleName = SYSTEM_MODULE_NAME.USER;

  protected router!: Router;

  private formInstance: OioFormInstance | undefined;

  public getFormInstance() {
    return this.formInstance;
  }

  @Widget.Method()
  public setFormInstance(formInstance: OioFormInstance | undefined) {
    this.formInstance = formInstance;
  }

  public initialize(config) {
    super.initialize(config);
    this.setComponent(ForgetPassword);
    return this;
  }

  @Widget.Reactive()
  protected formData: ResetPasswordData = {};

  @Widget.Reactive()
  protected majorConfig: MajorConfig | undefined;

  @Widget.Reactive()
  protected countryList: SelectItem<ResourceCountry>[] = [];

  @Widget.Reactive()
  protected selectedCountry: SelectItem<ResourceCountry> | undefined;

  @Widget.Reactive()
  protected get copyrightYear(): string {
    return new Date().getFullYear().toString();
  }

  @Widget.Reactive()
  protected get verificationRules(): Record<string, FormItemRule[]> {
    return {
      phone: [{ required: true, message: translateValueByKey('请输入手机号') }],
      verificationCode: [{ required: true, message: translateValueByKey('请输入短信验证码') }],
      picCode: [{ required: true, message: translateValueByKey('请输入图形验证码') }],
      newPassword: [{ required: true, validator: this.validateNewPassword.bind(this) }],
      confirmPassword: [{ required: true, validator: this.validateConfirmPassword.bind(this) }]
    };
  }

  protected async validateNewPassword(rule: FormItemRule, value: string): Promise<void | never> {
    if (!value) {
      return Promise.reject(translateValueByKey('请输入新密码'));
    }
    return Promise.resolve();
  }

  protected async validateConfirmPassword(role: FormItemRule, value: string): Promise<void | never> {
    if (!value) {
      return Promise.reject(translateValueByKey('请输入确认新密码'));
    }
    if (value !== this.formData.newPassword) {
      return Promise.reject(translateValueByKey('密码输入不一致，请检查'));
    }
    return Promise.resolve();
  }

  @Widget.Method()
  protected onSelectCountry(selected: SelectItem<ResourceCountry> | undefined) {
    this.selectedCountry = selected;
  }

  @Widget.Method()
  private gotoLogin() {
    this.router.push({ segments: [{ path: 'login' }] });
  }

  @Widget.Method()
  protected async fetchVerificationCode(): Promise<boolean> {
    const { phone } = this.formData;
    if (!phone) {
      return false;
    }
    const { broken, errorMsg } = await UserService.fetchVerificationCodeByForget(phone);
    if (broken) {
      if (errorMsg) {
        OioMessage.error(errorMsg);
      }
      return false;
    }
    return true;
  }

  @Widget.Method()
  protected async refreshPicCodeImage(): Promise<void> {
    this.formData.picCodeImage = this.getPicCode();
  }

  protected getPicCode() {
    const { phone } = this.formData;
    return `${http.getBaseURL()}/pamirs/api/refreshPicCode?time=${Date.now()}&picCodeScene=login_pic_code&login=${phone}`;
  }

  @Widget.Method()
  protected async onOk(): Promise<void> {
    const { phone, verificationCode, newPassword, confirmPassword } = this.formData;
    if (!phone || !verificationCode || !newPassword || !confirmPassword) {
      return;
    }
    const result = await this.executeResetPasswordByPhone(phone, verificationCode, newPassword, confirmPassword);
    if (result) {
      this.router.push({ segments: [{ path: 'login' }] });
    }
  }

  protected async executeResetPasswordByPhone(
    phone: string,
    verificationCode: string,
    password: string,
    confirmPassword
  ): Promise<boolean> {
    const { broken, errorMsg } = await UserService.resetPasswordByPhone(
      phone,
      verificationCode,
      password,
      confirmPassword,
      this.selectedCountry?.data?.phoneCode
    );
    if (broken) {
      if (errorMsg) {
        OioMessage.error(errorMsg);
      }
      return false;
    }
    return true;
  }

  protected async mountedProcess(): Promise<void> {
    // await this.refreshPicCodeImage();
    await this.initMajorConfig();
    await this.initCountryList();
  }

  protected async initMajorConfig(): Promise<void> {
    const res = await getMajorConfig();
    this.majorConfig = res;
  }

  protected async initCountryList(): Promise<void> {
    this.countryList =
      (await PhoneCodeQueryService.fetchPhoneCodeList())?.map((v) => ({
        key: v.id!,
        value: v.id!,
        label: `${v.name} ${v.phoneCode}`,
        data: v
      })) || [];
    this.selectedCountry = this.countryList?.[0];
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    this.router = useRouter().router;
  }

  public $$mounted() {
    super.$$mounted();
    this.mountedProcess();
  }
}
