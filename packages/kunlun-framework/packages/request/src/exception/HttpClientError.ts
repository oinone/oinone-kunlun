import { IErrorMessage, IResponseErrorResult, IResponseExtensions, IResponseNetworkError } from '../types';

export class HttpClientError extends Error implements IResponseErrorResult {
  /**
   * 原始错误
   */
  public readonly originalError: Error;

  /**
   * 错误信息
   */
  public readonly errors?: IErrorMessage[];

  /**
   * 扩展参数
   */
  public readonly extensions: IResponseExtensions | undefined;

  /**
   * 网络错误
   */
  public readonly networkError?: IResponseNetworkError;

  public constructor(message: string, data: IResponseErrorResult, originalError: Error) {
    super(message);
    this.originalError = originalError;
    this.errors = data.errors;
    this.extensions = data.extensions;
    this.networkError = data.networkError;
  }
}

export function getErrorCode(e: Error | unknown): string | undefined {
  if (e instanceof HttpClientError) {
    const error = e as HttpClientError;
    return error.errors?.[0]?.extensions?.errorCode;
  }
  return undefined;
}
