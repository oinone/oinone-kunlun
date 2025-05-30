import { ReturnPromise } from '@kunlun/shared';
import { NextLink, Operation } from 'apollo-link';
import { IResponseErrorResult, IResponseResult } from './message';

/**
 * 网络请求中间件处理器 (基于原生apollo封装)
 */
export type NetworkMiddlewareHandler = (operation: Operation, forward: NextLink) => Promise<any> | any;

/**
 * <h3>网络请求拦截器</h3>
 * <ul>
 *   <li>拦截器将按照注册顺序依次执行</li>
 *   <li>当任何一个拦截器返回false时，将中断拦截器执行</li>
 *   <li>内置拦截器总是优先于自定义拦截器执行</li>
 * </ul>
 *
 */
export interface NetworkInterceptor {
  /**
   * 成功拦截
   * @param response 响应结果
   */
  success?(response: IResponseResult): ReturnPromise<boolean>;

  /**
   * 错误拦截
   * @param response 响应结果
   */
  error?(response: IResponseErrorResult): ReturnPromise<boolean>;
}

/**
 * 拦截器可选项
 */
export interface InterceptorOptions {
  /**
   * 翻译拦截器
   */
  translate: NetworkInterceptor;

  /**
   * 网络错误拦截器
   */
  networkError: NetworkInterceptor;

  /**
   * 请求成功拦截器 (success)
   */
  requestSuccess: NetworkInterceptor;

  /**
   * 重定向拦截器 (success)
   */
  actionRedirect: NetworkInterceptor;

  /**
   * 登录重定向拦截器 (error)
   */
  loginRedirect: NetworkInterceptor;

  /**
   * 请求错误拦截器 (error)
   */
  requestError: NetworkInterceptor;

  /**
   * MessageHub拦截器 (success/error)
   */
  messageHub: NetworkInterceptor;

  /**
   * 前置拦截器
   */
  beforeInterceptors: NetworkInterceptor | NetworkInterceptor[];

  /**
   * 后置拦截器
   */
  afterInterceptors: NetworkInterceptor | NetworkInterceptor[];
}
