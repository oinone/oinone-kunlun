import { RuntimeContext, RuntimeContextServiceToken } from '@oinone/kunlun-engine';
import { SPI } from '@oinone/kunlun-spi';
import { DebugErrorAnalysisResult } from '../../../../typing';
import { DebugUtils } from '../../../debug-utils';
import { DebugRuntimeContextService, DebugRuntimeContextServiceToken } from '../../DebugRuntimeContextService';

@SPI.Service(DebugRuntimeContextServiceToken, { priority: 60 })
export class DebugRuntimeMaskService implements DebugRuntimeContextService {
  public analysis(runtimeContext: RuntimeContext): DebugErrorAnalysisResult | undefined {
    if (!runtimeContext.viewAction) {
      return undefined;
    }
    try {
      const maskTemplate = SPI.RawInstantiate(RuntimeContextServiceToken)?.seekViewMask(
        runtimeContext.viewAction,
        DebugUtils.getPageParameters()?.module
      );
      if (!maskTemplate) {
        return undefined;
      }
      return {
        title: '运行时Mask',
        message: '运行时上下文Mask',
        stackInfo: DebugUtils.toJSONString(maskTemplate)
      };
    } catch (e) {
      console.error('Runtime mask analysis error.', e);
    }
  }
}
