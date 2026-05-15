import { UrlHelper } from '@oinone/kunlun-shared';
import { setSessionPath } from '../../session';
import { IErrorMessage, IResponseErrorResult, NetworkInterceptor } from '../../types';

export class LoginRedirectInterceptor implements NetworkInterceptor {
  /**
   * 用户未登录错误码
   */
  public static USER_NOT_LOGIN_ERROR = [11500001, 20080002];

  public static SSO_NOT_LOGIN_ERROR = [10041000];

  /**
   * 禁止重定向URL列表
   */
  public static NOT_REDIRECT_PATH_NAMES = ['/login', '/sso-login'].map((v) => UrlHelper.appendBasePath(v));

  public error(response: IResponseErrorResult) {
    const { errors } = response;
    if (!errors || !errors.length) {
      return true;
    }
    for (const errorItem of errors) {
      const errorCode = errorItem.extensions?.errorCode;
      const errorCodeNumber = Number(errorCode);
      if (Number.isNaN(errorCodeNumber)) {
        continue;
      }
      const { pathname } = window.location;
      if (
        LoginRedirectInterceptor.USER_NOT_LOGIN_ERROR.includes(errorCodeNumber) &&
        !LoginRedirectInterceptor.NOT_REDIRECT_PATH_NAMES.includes(pathname)
      ) {
        if (this.redirectToLogin(response, errorItem)) {
          return false;
        }
        if (this.isIntercept()) {
          return false;
        }
      }
      if (
        LoginRedirectInterceptor.SSO_NOT_LOGIN_ERROR.includes(errorCodeNumber) &&
        !LoginRedirectInterceptor.NOT_REDIRECT_PATH_NAMES.includes(pathname)
      ) {
        if (this.redirectToSSOLogin(response, errorItem)) {
          return false;
        }
        if (this.isIntercept()) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 重定向到登录页
   * @param response 错误响应结果
   * @param errorItem 错误项
   * @return 是否重定向成功
   */
  public redirectToLogin(response: IResponseErrorResult, errorItem: IErrorMessage): boolean {
    if (window.location.href.includes('?redirect_url=')) {
      return true;
    }
    setSessionPath(undefined);
    const { pathname, search } = window.location;
    const redirect_url = pathname + search;
    window.location.href = `${UrlHelper.appendBasePath('login')}?redirect_url=${redirect_url}`;
    return true;
  }

  /**
   * 重定向到SSO登录页
   * @param response 错误响应结果
   * @param errorItem 错误项
   * @return 是否重定向成功
   */
  public redirectToSSOLogin(response: IResponseErrorResult, errorItem: IErrorMessage): boolean {
    const redirectUrl = errorItem.extensions.messages?.[0]?.data;
    if (redirectUrl) {
      window.location.assign(redirectUrl);
      return true;
    }
    return false;
  }

  protected isIntercept(): boolean {
    // fixme @zbh 20260515 平台无法统一处理，可能会用户自定义 After 拦截器失效，由业务自行处理。
    return false;
  }
}
