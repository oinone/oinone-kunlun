import { toString } from 'lodash-es';

export enum SystemErrorCode {
  NO_PERMISSION_ON_MODULE = '11040035', // 无该应用的权限
  NO_PERMISSION_ON_VIEW = '11040017', // 无该页面的权限
  NO_PERMISSION_ON_MODULE_ENTRY = '11500002', // 没有应用的入口权限
  NO_PERMISSION_ON_HOMEPAGE = '11500003', // 未找到首页
  FORM_VALIDATE_ERROR = '10050009' // 表单验证错误
}

export const notPermissionCodes: string[] = [
  SystemErrorCode.NO_PERMISSION_ON_MODULE,
  SystemErrorCode.NO_PERMISSION_ON_VIEW,
  SystemErrorCode.NO_PERMISSION_ON_MODULE_ENTRY,
  SystemErrorCode.NO_PERMISSION_ON_HOMEPAGE
];

/**
 * 首次登录重置密码错误码
 */
export const FIRST_RESET_PASSWORD_CODES = ['10030007', '20200008', '20060008'];

export function isFirstResetPasswordError(errorCode: string): boolean {
  return FIRST_RESET_PASSWORD_CODES.includes(toString(errorCode));
}

/**
 * 图形验证码错误码
 */
export const PIC_CODE_CODES = ['10030078', '20060080'];

export function isPicCodeError(errorCode: string): boolean {
  return PIC_CODE_CODES.includes(toString(errorCode));
}
