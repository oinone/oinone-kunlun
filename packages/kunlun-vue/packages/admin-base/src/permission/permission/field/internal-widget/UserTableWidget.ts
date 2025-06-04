import { ActiveRecord, Pagination } from '@oinone/kunlun-engine';
import { Condition } from '@oinone/kunlun-request';
import { IQueryPageResult, queryPage } from '@oinone/kunlun-service';
import { ResourcePermissionUserModel } from '../../type';
import { InlineTableWidget } from './InlineTableWidget';

export class UserTableWidget extends InlineTableWidget {
  private searchText = '';

  private defaultCondition: Condition | undefined;

  public setDefaultCondition(condition: Condition) {
    this.defaultCondition = condition;
  }

  public setSearchText(searchText: string) {
    this.searchText = searchText;
    this.refreshProcess();
  }

  public tableRefreshProcess(condition?: Condition) {
    super.refreshProcess(condition);
  }

  public initialize(props) {
    super.initialize(props);
    return this;
  }

  public async queryPage<T = ActiveRecord>(condition: Condition, pagination: Pagination): Promise<IQueryPageResult<T>> {
    if (this.defaultCondition) {
      condition.and(this.defaultCondition);
    } else {
      return null as any;
    }

    const result = await queryPage<T>(
      ResourcePermissionUserModel.model,
      {
        currentPage: pagination.current,
        pageSize: pagination.pageSize,
        condition
        // condition: this.searchText === '' ? undefined : `displayName =like= %${this.searchText}%`
      },
      ResourcePermissionUserModel.modelFields
    );
    return result;
  }
}
