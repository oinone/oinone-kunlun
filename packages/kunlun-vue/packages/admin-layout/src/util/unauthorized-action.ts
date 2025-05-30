import { ActionType, ActionContextType, ViewType, ViewMode, ViewActionTarget, deepClone } from '@kunlun/meta';
import { DslDefinition, XMLParse, DslDefinitionType } from '@kunlun/dsl';
import { MultiTabsRuntimeManifestMergedConfigManager, RuntimeViewAction } from '@kunlun/engine';
import { getDefaultMaskTemplate } from '../template';

function findNodeByType(dsl: DslDefinition, dslNodeType: DslDefinitionType | string): DslDefinition | null {
  function findNode(node: DslDefinition, nodeType: DslDefinitionType | string) {
    if (node.dslNodeType === nodeType) {
      return node;
    }

    if (Array.isArray(node.widgets)) {
      for (let i = 0; i < node.widgets.length; i++) {
        const foundNode = findNode(node.widgets[i], nodeType);
        if (foundNode) {
          return foundNode;
        }
      }
    }

    return null;
  }

  return findNode(dsl, dslNodeType);
}

export const unauthorizedActionName = 'unauthorized';
export const emptyHomepageModelName = '$$internal_empty_homepage_model';
export const urlHomepageModelName = '$$internal_url_homepage_model';

export const replaceStanderMainView = (dsl: DslDefinition) => {
  const hasMainView = findNodeByType(dsl, 'main-view');
  if (hasMainView) {
    return dsl;
  }

  const __dsl = deepClone(dsl) as DslDefinition;

  const content = findNodeByType(__dsl, 'content');
  if (!content) {
    return getDefaultMaskTemplate();
  }

  const widgetNode = findNodeByType(content, 'widget');
  if (widgetNode) {
    widgetNode.widget = 'main-view';
  }

  return __dsl;
};

export const getUnauthorizedAction = ({
  moduleName,
  model,
  target,
  name,
  title
}: {
  moduleName: string;
  model?: string;
  target?: ViewActionTarget;
  name: string;
  title?: string;
}): RuntimeViewAction => {
  let t = target;

  if (!t) {
    if (MultiTabsRuntimeManifestMergedConfigManager.isEnabled(moduleName)) {
      t = ViewActionTarget.OpenWindow;
    } else {
      t = ViewActionTarget.Router;
    }
  }

  const _model = model || emptyHomepageModelName;

  return {
    title: title || '无权限访问',
    moduleName,
    model: _model,
    modelName: unauthorizedActionName,
    name,
    actionType: ActionType.View,
    contextType: ActionContextType.ContextFree,
    target: t,
    resModel: unauthorizedActionName,
    resModelName: unauthorizedActionName,
    resViewType: ViewType.Form,
    resViewMode: ViewMode.Lookup,
    resView: {
      type: ViewType.Form,
      model: _model,
      name: unauthorizedActionName,
      modelName: unauthorizedActionName,
      template: XMLParse.INSTANCE.parse(`<view type="FORM"><element widget="UnauthorizedWidget"/></view>`)
    }
  };
};
