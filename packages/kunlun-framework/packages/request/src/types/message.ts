/**
 * 消息等级
 */
export enum ILevel {
  /**
   * debug
   */
  DEBUG = 'DEBUG',
  /**
   * info
   */
  INFO = 'INFO',
  /**
   * warning
   */
  WARN = 'WARN',
  /**
   * error
   */
  ERROR = 'ERROR',
  /**
   * success
   */
  SUCCESS = 'SUCCESS'
}

/**
 * 消息
 */
export interface IMessage {
  /**
   * 消息等级
   */
  level: ILevel;
  /**
   * 消息内容
   */
  message: string;
  /**
   * 错误类型
   */
  errorType: string;
  /**
   * 错误编码
   */
  errorCode: string;

  /**
   * 字段错误编码 (field.name) (暂时无效)
   */
  code?: string;

  /**
   * 字段名（无错误路径时通过字段生成错误路径）
   */
  field?: string;

  /**
   * 错误路径
   */
  path?: string[];
}

/**
 * 响应结果
 */
export interface IResponseResult {
  /**
   * 接口响应结果
   */
  data: unknown;

  /**
   * 错误信息
   */
  errors?: IErrorMessage[];

  /**
   * 扩展参数
   */
  extensions: IResponseExtensions;
}

/**
 * 扩展参数
 */
export interface IResponseExtensions {
  /**
   * 是否成功
   */
  success: boolean;

  /**
   * 消息
   */
  messages?: IMessage[];

  /**
   * 扩展参数
   */
  extra: Record<string, any>;
}

/**
 * 错误响应结果
 */
export interface IResponseErrorResult extends Partial<IResponseResult> {
  /**
   * 网络错误
   */
  networkError?: IResponseNetworkError;
}

/**
 * 网络错误
 */
export interface IResponseNetworkError extends SyntaxError {
  bodyText: string;
  statusCode: number;
  response: Response;
}

/**
 * 错误信息
 */
export interface IErrorMessage {
  /**
   * 消息等级
   */
  level?: ILevel;

  /**
   * 错误编码
   */
  code?: string;

  /**
   * 错误编码
   */
  errorType?: string;

  /**
   * 错误内容
   */
  message: string;

  /**
   * 扩展参数
   */
  extensions: {
    /**
     * 消息等级
     */
    level: ILevel;

    /**
     * 错误编码
     */
    errorCode: string;
    /**
     * 错误类型
     */
    errorType: string;

    /**
     * 错误声明类型
     */
    classification: string;

    /**
     * 消息
     */
    messages?: IMessage[];
  };
}
