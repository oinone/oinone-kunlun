import { RuntimeContext } from '@kunlun/engine';
import { SPI } from '@kunlun/spi';
import { DebugErrorAnalysisResult } from '../../../../typing';
import { DebugUtils } from '../../../debug-utils';
import { DebugRuntimeContextService, DebugRuntimeContextServiceToken } from '../../DebugRuntimeContextService';

@SPI.Service(DebugRuntimeContextServiceToken, { priority: 20 })
export class DebugRuntimeActionService implements DebugRuntimeContextService {
  public analysis(runtimeContext: RuntimeContext): DebugErrorAnalysisResult | undefined {
    return {
      title: '页面动作',
      message: '运行时上下文动作',
      stackInfo: DebugUtils.toJSONString(this.simplifyActions(runtimeContext))
    };
  }

  protected simplifyActions(runtimeContext: RuntimeContext) {
    return {
      handle: runtimeContext.handle,
      modelActions: runtimeContext.model.modelActions.map((v) => {
        const simplifyAction = { ...v };
        delete simplifyAction.modelDefinition;
        return simplifyAction;
      }),
      childrenContext: runtimeContext.childrenContext.map((v) => this.simplifyActions(v))
    };
  }
}
