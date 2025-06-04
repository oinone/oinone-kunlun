import { RuntimeContext } from '@oinone/kunlun-engine';
import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { DebugErrorAnalysisResult } from '../../typing';

/**
 * 调试运行时上下文异常分析服务
 */
export interface DebugRuntimeContextService {
  /**
   * 异常分析
   * @param runtimeContext 运行时上下文
   * @return 错误面板信息
   */
  analysis(runtimeContext: RuntimeContext): DebugErrorAnalysisResult | undefined;
}

/**
 * 调试运行时上下文异常分析服务Token
 */
export const DebugRuntimeContextServiceToken =
  ServiceIdentifier<DebugRuntimeContextService>('DebugRuntimeContextService');
