import { ActiveRecord, Pagination } from '@oinone/kunlun-engine';
import { Condition } from '@oinone/kunlun-request';
import { IQueryPageResult, queryPage } from '@oinone/kunlun-service';
import { ListSelectMode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { TableWidgetProps } from '../../../../view';
import { ResourcePermissionFieldGroupsModel } from '../../type';
import { InlineTableWidget } from './InlineTableWidget';

export type RadioChangeHandler = (data: ActiveRecord) => void;

export interface ModelTableHandler {
  onRadioChangeHandler?: RadioChangeHandler;
}

export interface ModelTableWidgetProps extends TableWidgetProps {
  onRadioChangeHandler: RadioChangeHandler;
}

export class ModelTableWidget extends InlineTableWidget<ModelTableWidgetProps> {
  private handler: ModelTableHandler = {};

  private searchText = '';

  public setSearchText(searchText: string) {
    this.searchText = searchText;
    this.refreshProcess();
  }

  public tableRefreshProcess(condition?: Condition) {
    super.refreshProcess(condition);
  }

  @Widget.Reactive()
  protected get selectMode(): ListSelectMode {
    return ListSelectMode.radio;
  }

  public initialize(props: ModelTableWidgetProps) {
    super.initialize(props);
    this.handler.onRadioChangeHandler = props.onRadioChangeHandler;
    return this;
  }

  public async queryPage<T = ActiveRecord>(condition: Condition, pagination: Pagination): Promise<IQueryPageResult<T>> {
    const result = await queryPage<T>(
      ResourcePermissionFieldGroupsModel.model,
      {
        currentPage: pagination.current,
        pageSize: pagination.pageSize,
        condition
        // condition: this.searchText === '' ? undefined : `displayName =like= %${this.searchText}%`
      },
      ResourcePermissionFieldGroupsModel.modelFields
    );
    return result;
  }

  public onRadioChange(data: ActiveRecord) {
    super.onRadioChange(data);
    this.handler.onRadioChangeHandler?.(data);
  }
}
