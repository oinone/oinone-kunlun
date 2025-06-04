import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { DebugErrorAnalysisResult, DebugResponseError } from '../../typing';

/**
 * 调试异常分析服务
 */
export interface DebugStackInfoService {
  /**
   * 异常分析
   * @param error 当前异常信息
   * @param errors 全部异常信息
   * @return 错误面板信息
   */
  analysis(error: DebugResponseError, errors: DebugResponseError[]): DebugErrorAnalysisResult | undefined;

  /**
   * 解析栈信息
   * @param error 当前异常信息
   * @param errors 全部异常信息
   */
  parseStackInfo(error: DebugResponseError, errors: DebugResponseError[]): unknown;
}

/**
 * 调试异常分析服务Token
 */
export const DebugStackInfoServiceToken = ServiceIdentifier<DebugStackInfoService>('DebugStackInfoService');

export const DebugDefaultStackInfoServiceType = '__default__';

export const DebugUnhandledExceptionTitle = '未解析异常';

export const DebugUnhandledExceptionMessage = '所有未经解析处理的异常信息';
