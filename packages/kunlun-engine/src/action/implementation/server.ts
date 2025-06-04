import { ActionElement, IServerAction } from '@oinone/kunlun-meta';
import { callFunction } from '@oinone/kunlun-service';
import { requestMutationByActionElement } from '../../helper';
import { RuntimeServerAction } from '../../runtime-metadata';

/**
 *@description 执行一个serverAction v2版本使用，为了兼容老版本
 *
 * @param {RuntimeServerAction} action 当前要执行的action
 * @param {Object} param 传递给action的参数
 * @param context
 */
export const executeServerAction = (
  action: RuntimeServerAction,
  param: Record<string, unknown> | Record<string, unknown>[],
  context = { maxDepth: 1 }
) => {
  return callFunction(
    action!.model,
    action as unknown as IServerAction,
    param,
    undefined,
    { path: action.sessionPath },
    context
  );
};

/**
 * v3新版使用
 */
export const runServerAction = (
  action: RuntimeServerAction,
  actionElement: ActionElement,
  param: Record<string, unknown> | Record<string, unknown>[],
  context = { maxDepth: 1 }
) => {
  return requestMutationByActionElement(action, actionElement, param, context);
};
