import { createDefaultLayout, resolveView, type RuntimeContext, RuntimeContextManager } from '../../../runtime-context';
import type { RuntimeLayoutDefinition, RuntimeView } from '../../../runtime-metadata';
import type { DslDefinition } from '@oinone/kunlun-dsl';
import type { ViewType } from '@oinone/kunlun-meta';

export function createRuntimeContextByView(
  view: RuntimeView,
  inline: boolean,
  nodeHandle?: string,
  rootHandle?: string
): RuntimeContext {
  const { type, name, model, modelName, module, moduleName, dsl, template } = view;
  const runtimeContext = RuntimeContextManager.createOrReplace(nodeHandle, RuntimeContextManager.get(rootHandle));
  runtimeContext.view = view;
  const viewLayout = seekViewLayout(view, inline, undefined, type, {
    viewType: type,
    module,
    moduleName,
    model,
    modelName,
    viewName: name,
    field: runtimeContext.field?.data
  });
  view.type = type;
  view.model = model;
  view.modelName = modelName;
  view.module = module;
  view.moduleName = moduleName;
  view.layout = viewLayout;
  view.dsl = dsl;
  view.template = template;
  resolveView(runtimeContext, view);
  return runtimeContext;
}

function seekViewLayout(
  view: RuntimeView,
  inline: boolean,
  viewLayout: RuntimeLayoutDefinition | undefined,
  viewType: ViewType,
  options: Record<string, unknown>
) {
  const { layout } = view;
  let finalViewLayout: DslDefinition | string | undefined = undefined;
  if (!finalViewLayout) {
    finalViewLayout = layout || viewLayout?.template;
  }
  if (!finalViewLayout) {
    finalViewLayout = createDefaultLayout(viewType, inline);
  }
  return finalViewLayout;
}
