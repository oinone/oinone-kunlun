import {
  ActiveRecords,
  DeleteActiveRecordsByEntityPredict,
  PushActiveRecordsPredict,
  SubmitValue,
  UpdateActiveRecordsByEntityPredict,
  UpdateEntity
} from '@kunlun/engine';
import { ViewMode, ViewType } from '@kunlun/meta';
import { CallChaining } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseObjectView, BaseView } from '../../basic';

/**
 * <h3>搜索视图</h3>
 * <p>搜索视图是服务于表格视图{@link TableView}搜索功能的，其不应独立出现在根视图中</p>
 * <p>
 * 对于内联视图而言，搜索视图应强制使用自身数据源进行搜索操作，它的数据来源不取决于外部任何数据源。
 * 同样的，刷新钩子函数（refreshCallChaining）也是不关心自身视图下任何组件的刷新，而是直接调用父视图的刷新钩子函数
 * </p>
 */
@SPI.ClassFactory(BaseView.Token({ type: ViewType.Search }))
export class SearchView extends BaseObjectView {
  @Widget.Reactive()
  @Widget.Provide()
  protected get viewMode(): ViewMode {
    return this.currentViewMode || (this.getDsl().mode?.toUpperCase() as ViewMode) || ViewMode.Create;
  }

  /**
   * 数据提交
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  public get submitCallChaining(): CallChaining<SubmitValue> | undefined {
    return this.currentSubmitCallChaining;
  }

  /**
   * 数据校验
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  public get validatorCallChaining(): CallChaining<boolean> | undefined {
    return this.currentValidatorCallChaining;
  }

  public reloadDataSource(records: ActiveRecords | undefined) {
    this.parentReloadDataSource?.(records);
  }

  public pushDataSource(records: ActiveRecords, predict?: PushActiveRecordsPredict) {
    this.parentPushDataSource?.(records, predict);
  }

  public updateDataSource(records: UpdateEntity[]) {
    this.parentUpdateDataSource?.(records);
  }

  public updateDataSourceByEntity(records: ActiveRecords, predict?: UpdateActiveRecordsByEntityPredict) {
    this.parentUpdateDataSourceByEntity?.(records, predict);
  }

  public deleteDataSource(recordIndexes: number[]) {
    this.parentDeleteDataSource?.(recordIndexes);
  }

  public deleteDataSourceByEntity(records: ActiveRecords, predict?: DeleteActiveRecordsByEntityPredict) {
    this.parentDeleteDataSourceByEntity?.(records, predict);
  }

  public initialize(props) {
    if (!props.dataSource) {
      props.dataSource = null;
    }
    if (!props.activeRecords) {
      props.activeRecords = [{}];
    }
    super.initialize(props);
    return this;
  }

  protected $$mounted() {
    if (this.parentRefreshCallChaining && this.currentRefreshCallChaining) {
      this.currentRefreshCallChaining.callAfter(
        async (args) => {
          await this.parentRefreshCallChaining?.syncCall(...(args || []));
        },
        { immutable: true }
      );
    }

    super.$$mounted();

    this.parentRefreshCallChaining?.unhook(this.path);
    this.parentSubmitCallChaining?.unhook(this.path);
    this.parentValidatorCallChaining?.unhook(this.path);
  }
}
