import { IdModel, Pagination } from '../typing';
import { GenericFunctionService } from './GenericFunctionService';
import { QueryPageResult, QueryWrapper } from './metadata';

export interface ModelApi<T extends IdModel> {
  queryListByWrapper(queryWrapper: QueryWrapper): Promise<T[]>;

  queryPage(page: Pagination, queryWrapper: QueryWrapper): Promise<QueryPageResult<T>>;
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
