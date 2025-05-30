import { RuntimeContext } from '@kunlun/engine';
import { SPI } from '@kunlun/spi';
import { DebugErrorAnalysisResult } from '../../../../typing';
import { DebugUtils } from '../../../debug-utils';
import { DebugRuntimeContextService, DebugRuntimeContextServiceToken } from '../../DebugRuntimeContextService';

@SPI.Service(DebugRuntimeContextServiceToken, { priority: 70 })
export class DebugRuntimeTemplateService implements DebugRuntimeContextService {
  public analysis(runtimeContext: RuntimeContext): DebugErrorAnalysisResult | undefined {
    return {
      title: '运行时渲染模板',
      message: '合并Layout和DSL后的Template',
      stackInfo: DebugUtils.toJSONString(runtimeContext.viewTemplate)
    };
  }
}
