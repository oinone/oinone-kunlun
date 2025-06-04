import { UrlHelper } from '@oinone/kunlun-shared';
import { IResponseErrorResult, NetworkInterceptor } from '../../types';
import { setSessionPath } from '../../session';

export class LoginRedirectInterceptor implements NetworkInterceptor {
  /**
   * 用户未登录错误码
   */
  public static USER_NOT_LOGIN_ERROR = [11500001, 20080002];

  /**
   * 禁止重定向URL列表
   */
  public static NOT_REDIRECT_PATH_NAMES = ['/login', '/auth/login'].map((v) => UrlHelper.appendBasePath(v));

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
        if (this.redirectToLogin(response)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 重定向到登录页
   * @param response 错误响应结果
   * @return 是否重定向成功
   */
  public redirectToLogin(response: IResponseErrorResult): boolean {
    if (window.location.href.includes('?redirect_url=')) {
      return true;
    }
    setSessionPath(undefined);
    const { pathname, search } = window.location;
    const redirect_url = pathname + search;
    window.location.href = `${UrlHelper.appendBasePath('login')}?redirect_url=${redirect_url}`;
    return true;
  }
}
