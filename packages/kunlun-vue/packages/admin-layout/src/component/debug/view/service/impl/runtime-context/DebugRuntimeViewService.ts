import type { RuntimeContext } from '@oinone/kunlun-engine';
import { SPI } from '@oinone/kunlun-spi';
import type { DebugErrorAnalysisResult } from '../../../../typing';
import { DebugUtils } from '../../../debug-utils';
import { type DebugRuntimeContextService, DebugRuntimeContextServiceToken } from '../../DebugRuntimeContextService';

@SPI.Service(DebugRuntimeContextServiceToken, { priority: 30 })
export class DebugRuntimeViewService implements DebugRuntimeContextService {
  public analysis(runtimeContext: RuntimeContext): DebugErrorAnalysisResult | undefined {
    return {
      title: '运行时视图',
      message: '运行时上下文视图',
      stackInfo: DebugUtils.toJSONString(runtimeContext.view)
    };
  }
}
