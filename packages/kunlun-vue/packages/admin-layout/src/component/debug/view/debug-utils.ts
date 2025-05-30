import { RuntimeContext, ViewActionQueryParameter } from '@kunlun/engine';
import { MessageHub } from '@kunlun/request';
import { useMatched } from '@kunlun/router';
import { Optional } from '@kunlun/shared';
import { DebugRequestInfo } from '../typing';
import { DebugInfoStorage } from './storage';

export class DebugUtils {
  public static generatorDownloadRequestInfo(
    requestInfo: DebugRequestInfo | undefined,
    responseData: string | undefined
  ) {
    return {
      ...requestInfo,
      decodeURL: Optional.ofNullable(requestInfo?.url)
        .map((v) => decodeURIComponent(v))
        .orElse('no url'),
      header: requestInfo?.header,
      gqlInfos: requestInfo?.gqlInfos?.map((v) => ({
        ...v,
        variables: v.variables
      })),
      functions: requestInfo?.functions?.map((v) => ({
        ...v,
        responseData: v.responseData
      })),
      responseData
    };
  }

  public static downloadJSON(data: string, filename: string) {
    if (!data) {
      MessageHub.error('无调试数据，无需下载');
      return;
    }
    const blob = new Blob([data], { type: 'application/json' });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    document.body.removeChild(a);

    a = null as any;
  }

  public static parseJSON = (
    data: string | undefined,
    defaultValue: string
  ): string | Record<string, unknown> | Record<string, unknown>[] => {
    return Optional.ofNullable(data)
      .map((v) => {
        try {
          return JSON.parse(v);
        } catch (e) {
          return v;
        }
      })
      .orElse(defaultValue);
  };

  public static toJSONObject = (data: unknown) => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (ignored) {}
      return data;
    }
    return data || {};
  };

  public static toJSONString(data: unknown) {
    return JSON.stringify(data, null, 2);
  }

  public static runtimeContextToJSONString(runtimeContext: RuntimeContext): string {
    return DebugUtils.toJSONString(DebugUtils.simplifyRuntimeContext(runtimeContext));
  }

  public static simplifyRuntimeContext(runtimeContext: RuntimeContext): RuntimeContext {
    return {
      handle: runtimeContext.handle,
      model: {
        ...runtimeContext.model,
        modelFields: runtimeContext.model.modelFields.map((v) => {
          const simplifyField = { ...v };
          delete simplifyField.modelDefinition;
          return simplifyField;
        }),
        modelActions: runtimeContext.model.modelActions.map((v) => {
          const simplifyAction = { ...v };
          delete simplifyAction.modelDefinition;
          return simplifyAction;
        })
      },
      module: runtimeContext.module,
      view: runtimeContext.view,
      viewDsl: runtimeContext.viewDsl,
      viewLayout: runtimeContext.viewLayout,
      viewTemplate: runtimeContext.viewTemplate,
      childrenContext: runtimeContext.childrenContext.map((v) => DebugUtils.simplifyRuntimeContext(v))
    } as RuntimeContext;
  }

  public static getDebugStorage() {
    return DebugInfoStorage.INSTANCE;
  }

  public static getPageParameters(): ViewActionQueryParameter | undefined {
    const { matched } = useMatched();
    return matched.segmentParams?.debug;
  }
}
