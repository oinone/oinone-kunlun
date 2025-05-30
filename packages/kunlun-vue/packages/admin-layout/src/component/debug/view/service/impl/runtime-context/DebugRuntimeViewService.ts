import { RuntimeContext } from '@kunlun/engine';
import { SPI } from '@kunlun/spi';
import { DebugErrorAnalysisResult } from '../../../../typing';
import { DebugUtils } from '../../../debug-utils';
import { DebugRuntimeContextService, DebugRuntimeContextServiceToken } from '../../DebugRuntimeContextService';

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
