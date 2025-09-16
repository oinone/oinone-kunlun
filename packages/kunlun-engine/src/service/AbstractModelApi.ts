import { OioListItem, OioTreeNode } from '@oinone/kunlun-shared';
import { IdModel, Pagination } from '../typing';
import { GenericFunctionService } from './GenericFunctionService';
import { QueryPageResult, QueryWrapper } from './metadata';

export interface ModelApi<T extends IdModel> {
  queryListByWrapper(queryWrapper: QueryWrapper): Promise<T[]>;

  queryPage(page: Pagination, queryWrapper: QueryWrapper): Promise<QueryPageResult<T>>;
}

export interface ListModelApi<T extends IdModel> extends ModelApi<T> {
  convertListData(list: T[], options?: { computeTitle?: (data?: T) => string }): OioListItem<T>[];
}

export interface TreeModelApi<T extends IdModel> extends ListModelApi<T> {
  convertTreeData(
    list: T[],
    options?: {
      computeTitle?: (data?: T) => string;
    }
  ): OioTreeNode<T>[];
}

export abstract class AbstractModelApi<T extends IdModel> implements ModelApi<T> {
  protected abstract get modelModel(): string;

  public async queryListByWrapper(queryWrapper: QueryWrapper): Promise<T[]> {
    return (
      (await GenericFunctionService.INSTANCE.simpleExecuteByFun(this.modelModel, 'queryListByWrapper', queryWrapper)) ||
      []
    );
  }

  public async queryPage(page: Pagination, queryWrapper: QueryWrapper): Promise<QueryPageResult<T>> {
    return (
      (await GenericFunctionService.INSTANCE.simpleExecuteByFun(this.modelModel, 'queryPage', page, queryWrapper)) || {
        content: [],
        totalPages: 0,
        totalElements: 0
      }
    );
  }
}
