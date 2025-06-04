import {
  ActiveRecord,
  MultiTabsRuntimeManifestMergedConfigManager,
  MultiTabsRouter,
  RuntimeAction,
  RuntimeViewAction
} from '@oinone/kunlun-engine';
import { Expression, ExpressionRunParam } from '@oinone/kunlun-expression';
import { IViewAction, ViewType } from '@oinone/kunlun-meta';
import { NavigateOptions } from '@oinone/kunlun-router';
import { getModel } from '@oinone/kunlun-service';
import { isString, set as setValue } from 'lodash-es';
import { homepageMaybeRuntimeContext } from './utils';

export function executeMapping(
  getterParameters: ExpressionRunParam,
  activeRecord: ActiveRecord,
  mapping: Record<string, unknown>
) {
  Object.entries(mapping).forEach(([origin, target]) => {
    let value: unknown | undefined;
    if (isString(target)) {
      value = Expression.run(getterParameters, target, undefined);
    } else {
      value = target;
    }
    if (value !== undefined) {
      setValue(activeRecord, origin, value);
    }
  });
}

const gotoTableView = async (action: RuntimeAction, executeViewAction: Function) => {
  // 当前视图可能无table action
  const model = await getModel(action.model!);
  let viewAction: null | undefined | IViewAction | RuntimeViewAction = null;
  viewAction = (model.viewActionList || []).find((a) => {
    return a.viewType === ViewType.Table;
  });
  // 无table action取首页action
  if (!viewAction) {
    viewAction = (await homepageMaybeRuntimeContext()) as unknown as RuntimeViewAction;
  }
  executeViewAction(viewAction!);
};

/**
 * FIXME: 未解决问题
 * 1. 当前模型无table视图，跳转失效
 * 2. 未处理浏览器点击回退
 * 3. 当前模型有多个table视图，跳转的视图可能是错误的
 * */
export const gotoPrevPage = (
  action: RuntimeAction,
  executeViewAction: Function,
  navigate = (segments: string, options?: NavigateOptions) => {}
) => {
  if (MultiTabsRuntimeManifestMergedConfigManager.isEnabled()) {
    MultiTabsRouter.useRouter().back();
    return;
  }
  try {
    const historyLength = window.history.length;
    // history的长度大于2 执行back返回上一页
    if (historyLength > 2) {
      window.history.back();
      return;
    }
    // 判断refer
    const refer = document.referrer;
    if (refer && refer !== window.location.href) {
      const url = new URL(refer);
      const pathname = url.pathname;
      // 如果refer是`/page`的就返回，其它的都跳转到当前模型表格页
      if (pathname.indexOf('/page') >= 0) {
        navigate(pathname);
      } else {
        gotoTableView(action, executeViewAction);
      }
      return;
    }
    gotoTableView(action, executeViewAction);
  } catch (e) {
    gotoTableView(action, executeViewAction);
  }
};
