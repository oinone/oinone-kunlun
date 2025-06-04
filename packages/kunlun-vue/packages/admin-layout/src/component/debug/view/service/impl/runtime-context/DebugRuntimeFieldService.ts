import { RuntimeContext } from '@oinone/kunlun-engine';
import { SPI } from '@oinone/kunlun-spi';
import { DebugErrorAnalysisResult } from '../../../../typing';
import { DebugUtils } from '../../../debug-utils';
import { DebugRuntimeContextService, DebugRuntimeContextServiceToken } from '../../DebugRuntimeContextService';

@SPI.Service(DebugRuntimeContextServiceToken, { priority: 10 })
export class DebugRuntimeFieldService implements DebugRuntimeContextService {
  public analysis(runtimeContext: RuntimeContext): DebugErrorAnalysisResult | undefined {
    const simplifyFields = this.simplifyFields(runtimeContext);
    return {
      title: '页面字段',
      message: '运行时上下文字段',
      simplifyFields,
      stackInfo: DebugUtils.toJSONString(simplifyFields)
      // component: defineAsyncComponent(
      //   () => import('../../../components/runtime-context/DebugRuntimeFieldComponent.vue')
      // )
    };
  }

  protected simplifyFields(runtimeContext: RuntimeContext) {
    return {
      handle: runtimeContext.handle,
      modelFields: runtimeContext.model.modelFields.map((v) => {
        const simplifyField = { ...v };
        delete simplifyField.modelDefinition;
        return simplifyField;
      }),
      childrenContext: runtimeContext.childrenContext.map((v) => this.simplifyFields(v))
    };
  }
}
