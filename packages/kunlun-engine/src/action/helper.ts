import { ViewActionTarget } from '@oinone/kunlun-meta';
import { useMatched } from '@oinone/kunlun-router';
import { RuntimeViewAction } from '../runtime-metadata';
import { MultiTabsRuntimeManifestMergedConfigManager } from '../view/multi-tabs/config-manager';
import { ViewActionQueryParameter } from './typing';

export function generatorViewActionQueryParameter(
  action: RuntimeViewAction,
  options?: {
    moduleName?: string;
    /**
     * @deprecated please using usingLastedModule
     */
    usingLastedUrlParameters?: boolean;
    usingLastedModule?: boolean;
  }
): ViewActionQueryParameter {
  const {
    page: { module: lastedModule, language }
  } = useMatched().matched.segmentParams;

  const {
    resModuleName,
    resModuleDefinition,
    moduleName,
    moduleDefinition,
    resViewType,
    viewType,
    model,
    name,
    target
  } = action;
  let targetModule: string | undefined = options?.moduleName;
  if (!targetModule) {
    if (options?.usingLastedModule || options?.usingLastedUrlParameters) {
      targetModule = resModuleName || resModuleDefinition?.name || lastedModule || moduleName || moduleDefinition?.name;
    } else {
      targetModule = resModuleName || resModuleDefinition?.name || moduleName || moduleDefinition?.name;
    }
  }
  return {
    module: targetModule!,
    viewType: resViewType || viewType,
    model,
    action: name,
    target: MultiTabsRuntimeManifestMergedConfigManager.isEnabled(options?.moduleName || targetModule)
      ? ViewActionTarget.OpenWindow
      : target,
    scene: name,
    language
  };
}
