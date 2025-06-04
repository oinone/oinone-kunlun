import { DslDefinition } from '@oinone/kunlun-dsl';
import { RuntimeContext } from '@oinone/kunlun-engine';

/**
 * 获取宿主视图名称
 */
export function findTandemActionHostViewName(option: {
  metadataRuntimeContext: RuntimeContext;
  rootRuntimeContext: RuntimeContext;
  isDialog: boolean;
  isDrawer: boolean;
}) {
  const { metadataRuntimeContext, isDialog, isDrawer } = option;
  let { rootRuntimeContext } = option;
  const findRootViewName = () => {
    let viewName = '';

    while (rootRuntimeContext.parentContext && rootRuntimeContext.parentContext.view) {
      rootRuntimeContext = rootRuntimeContext.parentContext;
    }
    viewName = rootRuntimeContext.view.name!;

    return viewName;
  };

  let viewName = '';

  // 弹窗视图
  if (isDialog || isDrawer) {
    if (metadataRuntimeContext.field) {
      viewName = metadataRuntimeContext.parentContext?.view.name || '';
    } else {
      viewName = (rootRuntimeContext.view.dsl as DslDefinition)?.name;
    }

    if (!viewName) {
      viewName = findRootViewName();
    }
  } else {
    viewName = findRootViewName();
  }

  return viewName;
}
