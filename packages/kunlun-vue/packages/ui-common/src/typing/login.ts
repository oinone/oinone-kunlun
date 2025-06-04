import { CurrentLanguage } from '@oinone/kunlun-engine';
import { RuntimeConfigOptions } from '@oinone/kunlun-meta';

export interface LoginData {
  login?: string;
  password?: string;
  phone?: string;
  verificationCode?: string;
  picCode?: string;
  email?: string;
  emailCode?: string;
}

export enum LoginMode {
  ACCOUNT = 'ACCOUNT',
  CODE = 'CODE',
  EMAIL = 'EMAIL'
}

/**
 * 登录页配置
 */
export interface LoginConfig extends RuntimeConfigOptions {
  /**
   * 登录按钮label
   */
  loginLabel?: string;

  /**
   * 是否显示忘记密码按钮
   */
  forgetPassword?: boolean;

  /**
   * 忘记密码按钮Label
   */
  forgetPasswordLabel?: string;

  /**
   * 是否显示注册按钮
   */
  register?: boolean;

  /**
   * 注册按钮Label
   */
  registerLabel?: string;

  /**
   * 是否显示验证码登录Tab
   */
  codeLogin?: boolean;

  /**
   * 账号登录Tab Label
   */
  accountLoginLabel?: string;

  /**
   * 验证码登录Tab Label
   */
  codeLoginLabel?: string;

  /**
   * 账号登录-账号输入框Placeholder
   */
  accountPlaceholder?: string;

  /**
   * 账号登录-密码输入框Placeholder
   */
  passwordPlaceholder?: string;

  /**
   * 验证码登录-手机号输入框Placeholder
   */
  phonePlaceholder?: string;

  /**
   * 验证码登录-验证码输入框Placeholder
   */
  codePlaceholder?: string;

  /**
   * 是否开启邮箱登录
   */
  email?: boolean;

  /**
   * 邮箱登录label
   */
  emailLoginLabel?: string;

  /**
   * 邮箱登录输入框占位
   */
  emailPlaceholder?: string;

  /**
   * 邮箱登录验证码输入框占位
   */
  emailCodePlaceholder?: string;
}

export const loginMessageHubName = 'user_login_message_hub$';

export const LOGIN_LANGUAGE_STORAGE_KEY = CurrentLanguage.LOCAL_STORAGE_CODE_KEY;

export const LOGIN_LANGUAGE_ISO_STORAGE_KEY = CurrentLanguage.LOCAL_STORAGE_ISO_CODE_KEY;

export const defaultLoginPageSettings = {
  loginLabel: '登录',

  forgetPassword: true,
  forgetPasswordLabel: '忘记密码',

  register: false,
  registerLabel: '去注册',

  accountLoginLabel: '账号登录',
  accountPlaceholder: '请输入您的账号',
  passwordPlaceholder: '请输入您的密码',

  codeLogin: true,
  codeLoginLabel: '验证码登录',
  phonePlaceholder: '请输入您的手机号',
  codePlaceholder: '请输入收到的验证码',

  email: false,
  emailLoginLabel: '邮箱登录',
  emailPlaceholder: '请输入您的邮箱',
  emailCodePlaceholder: '请输入收到的验证码'
};

export const defaultLoginErrorMessages = {
  loginEmpty: '用户名不能为空',
  passwordEmpty: '密码不能为空',
  picCodeEmpty: '图形验证码不能为空',
  phoneEmpty: '手机号不能为空',
  emailEmpty: '邮箱不能为空',
  verificationCodeEmpty: '验证码不能为空',
  picCodeError: '图形验证码错误',
  inputVerificationCodeAlign: '请重新输入验证码'
} as Record<string, string>;
