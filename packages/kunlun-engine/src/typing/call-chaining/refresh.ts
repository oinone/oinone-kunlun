import { Condition } from '@kunlun/request';
import { BooleanHelper } from '@kunlun/shared';
import { isBoolean, isNil } from 'lodash-es';

export enum RefreshCallChainingScope {
  search,
  searchReset
}

export interface RefreshCallChainingParameters {
  /**
   * 刷新作用域声明
   */
  scope?: RefreshCallChainingScope;
  /**
   * 仅刷新一次父视图
   */
  refreshParent: boolean;

  condition?: Condition;
  currentPage?: number;
  pageSize?: number;
}

export function getRefreshParameters(args: unknown[] | undefined): RefreshCallChainingParameters {
  const parameters = args?.[0] as boolean | RefreshCallChainingParameters | undefined;
  let refreshParent = false;
  if (!isNil(parameters)) {
    if (isBoolean(parameters)) {
      refreshParent = BooleanHelper.toBoolean(parameters) || false;
    } else {
      return parameters;
    }
  }
  return {
    refreshParent
  };
}
