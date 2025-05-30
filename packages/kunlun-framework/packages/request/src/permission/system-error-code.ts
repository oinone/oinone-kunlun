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
