import type { RuntimeContext } from '@oinone/kunlun-engine';
import { SPI } from '@oinone/kunlun-spi';
import type { DebugErrorAnalysisResult } from '../../../../typing';
import { DebugUtils } from '../../../debug-utils';
import { type DebugRuntimeContextService, DebugRuntimeContextServiceToken } from '../../DebugRuntimeContextService';

@SPI.Service(DebugRuntimeContextServiceToken, { priority: 40 })
export class DebugRuntimeDslService implements DebugRuntimeContextService {
  public analysis(runtimeContext: RuntimeContext): DebugErrorAnalysisResult | undefined {
    return {
      title: '运行时DSL',
      message: '运行时上下文DSL',
      stackInfo: DebugUtils.toJSONString(runtimeContext.viewDsl)
    };
  }
}
