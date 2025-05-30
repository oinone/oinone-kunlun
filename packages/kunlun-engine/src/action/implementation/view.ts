import { ViewActionTarget } from '@kunlun/meta';
import { getSessionPath } from '@kunlun/request';
import { getRouterInstance, Matched, Router, useMatched } from '@kunlun/router';
import { StandardString } from '@kunlun/shared';
import { RuntimeViewAction } from '../../runtime-metadata';
import { Dialog, Drawer } from '../../view';
import { RedirectTargetEnum } from '../typing';

/**
 * <h3>通用执行ViewAction方法</h3>
 * <ul>
 *  <li>{@link ViewActionTarget#Router} {@link ViewActionTarget#OpenWindow}
 *    <p>执行通用跳转逻辑</p>
 *  </li>
 *  <li>{@link ViewActionTarget#Dialog} {@link ViewActionTarget#Drawer}
 *    <p>执行通用弹出层逻辑</p>
 *  </li>
 * </ul>
 * <p>其他类型跳转方式均不支持</p>
 *
 * @param action 当前要执行的action
 * @param router 路由
 * @param matched url参数
 * @param extra 扩展参数
 * @param target {@link RedirectTargetEnum} 浏览器内置跳转参数
 */
export function executeViewAction(
  action: RuntimeViewAction,
  router: Router | null | undefined = getRouterInstance(),
  matched: Matched | null | undefined = useMatched().matched,
  extra: Record<string, unknown> = {},
  target?: RedirectTargetEnum
) {
  let viewActionTarget = action.target;
  if (!viewActionTarget) {
    viewActionTarget = ViewActionTarget.Router;
  }
  switch (viewActionTarget) {
    case ViewActionTarget.Router:
    case ViewActionTarget.OpenWindow:
      executeRouterViewAction(action, router, matched, extra, target);
      break;
    case ViewActionTarget.Dialog:
      Dialog.createByViewAction(action, extra);
      break;
    case ViewActionTarget.Drawer:
      Drawer.createByViewAction(action, extra);
      break;
    default:
      console.error('Invalid view action target', action);
  }
}

/**
 * 执行路由跳转动作
 * @param action 跳转动作
 * @param router 当前路由
 * @param matched 当前路由匹配
 * @param extra 扩展参数
 * @param target 浏览器跳转参数
 */
function executeRouterViewAction(
  action: RuntimeViewAction,
  router: Router | null | undefined = getRouterInstance(),
  matched: Matched | null | undefined = useMatched().matched,
  extra: Record<string, unknown> = {},
  target?: RedirectTargetEnum
) {
  if (!router || !matched) {
    return;
  }
  const preserveParameter = extra.preserveParameter as boolean | undefined;
  let lastedPage;
  if (preserveParameter === false) {
    lastedPage = {};
  } else {
    lastedPage = (matched.segmentParams.page as Record<string, unknown>) || {};
  }
  const parameters: Record<string, string> = {
    ...lastedPage,
    module: `${action.resModuleName || lastedPage.module || action.moduleName}`,
    viewType: action.resViewType || action.viewType,
    model: action.model,
    action: action.name,
    ...extra
  };
  let sessionPath = extra.sessionPath as StandardString;
  delete parameters.preserveParameter;
  delete parameters.sessionPath;
  if (sessionPath === undefined) {
    sessionPath = action.sessionPath || getSessionPath();
    if (sessionPath) {
      parameters.path = sessionPath;
    } else {
      delete parameters.path;
    }
  } else if (sessionPath === null) {
    delete parameters.path;
  } else {
    parameters.path = sessionPath;
  }
  router.push(
    {
      segments: [
        {
          path: matched.path.substring(1) || '',
          parameters: {
            ...parameters,
            scene: action && action.name,
            target: action.target
          },
          extra: {
            preserveParameter: false
          }
        }
      ]
    },
    target
  );
}
