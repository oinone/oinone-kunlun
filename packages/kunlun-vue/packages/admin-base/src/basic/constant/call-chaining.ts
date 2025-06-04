import { CallAfterFunction } from '@oinone/kunlun-shared';

/**
 * 视图挂载 - 1
 */
export const VIEW_WIDGET_PRIORITY = 0;

/**
 * 数据组件挂载 - 2
 */
export const FETCH_DATA_WIDGET_PRIORITY = 100;

/**
 * 子视图组件挂载 - 3
 */
export const SUBVIEW_WIDGET_PRIORITY = 200;

function isValidatorSuccess(result: boolean | undefined) {
  return result == null || result;
}

export const validatorCallChainingCallAfterFn: CallAfterFunction<boolean> = (
  args,
  callBeforeResult,
  callAfterResult
) => {
  if (isValidatorSuccess(callBeforeResult)) {
    if (callAfterResult.status) {
      return callAfterResult.results.every((result) => isValidatorSuccess(result));
    }
    return callAfterResult.status;
  }
  return false;
};
