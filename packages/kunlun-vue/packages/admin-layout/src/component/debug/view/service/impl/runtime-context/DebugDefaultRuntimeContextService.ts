import { RuntimeContext } from '@kunlun/engine';
import { SPI } from '@kunlun/spi';
import { DebugErrorAnalysisResult } from '../../../../typing';
import { DebugUtils } from '../../../debug-utils';
import { DebugRuntimeContextService, DebugRuntimeContextServiceToken } from '../../DebugRuntimeContextService';

@SPI.Service(DebugRuntimeContextServiceToken, { priority: 1000 })
export class DebugDefaultRuntimeContextService implements DebugRuntimeContextService {
  public analysis(runtimeContext: RuntimeContext): DebugErrorAnalysisResult | undefined {
    return {
      title: '完整上下文',
      message: '运行时上下文全部内容',
      stackInfo: DebugUtils.runtimeContextToJSONString(runtimeContext)
    };
  }
}
