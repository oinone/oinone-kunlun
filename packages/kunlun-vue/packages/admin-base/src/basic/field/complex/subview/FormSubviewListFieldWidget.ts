import {
  ActiveRecord,
  ActiveRecords,
  ActiveRecordsOperator,
  DeleteActiveRecordsByEntityPredict,
  RuntimeM2MField,
  RuntimeO2MField,
  SubmitCacheManager
} from '@kunlun/engine';
import { ViewType } from '@kunlun/meta';
import { Condition } from '@kunlun/request';
import { ReturnPromise } from '@kunlun/shared';
import { ComputeTrigger, WidgetTrigger } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { InlineTable } from '../../../../components';
import { IFormSubviewListFieldWidget, RefreshProcessFunction } from '../../../types';
import { FormComplexFieldProps } from '../FormComplexFieldWidget';
import { FormSubviewFieldWidget } from './FormSubviewFieldWidget';

export class FormSubviewListFieldWidget<
    Field extends RuntimeO2MField | RuntimeM2MField = RuntimeO2MField | RuntimeM2MField,
    Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
  >
  extends FormSubviewFieldWidget<ActiveRecord[], Field, Props>
  implements IFormSubviewListFieldWidget<Field>
{
  protected defaultSubviewType = ViewType.Table;

  protected subviewSubmitCache: SubmitCacheManager | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(InlineTable);
    return this;
  }

  protected initSubviewAfterProperties(props: Props) {
    const { submitCache } = this;
    if (submitCache) {
      this.subviewSubmitCache = submitCache.clone();
      this.runtimeSubviewContext.extendData.subviewSubmitCache = this.subviewSubmitCache;
    }
  }

  @Widget.Method()
  @Widget.Inject('refreshProcess')
  protected parentRefreshProcess: RefreshProcessFunction | undefined;

  @Widget.Method()
  @Widget.Provide()
  protected async refreshProcess(condition?: Condition) {
    // do nothing.
  }

  @Widget.Reactive()
  @Widget.Provide()
  public get dataSource(): ActiveRecord[] | undefined {
    return this.getCurrentDataSource() || undefined;
  }

  public set dataSource(dataSource: ActiveRecord[] | undefined) {
    this.setCurrentDataSource(dataSource);
  }

  public reloadDataSource(records: ActiveRecords | undefined) {
    this.setCurrentDataSource(records);
    this.updateValue(this.dataSource);
  }

  @Widget.Reactive()
  @Widget.Provide()
  public get activeRecords(): ActiveRecord[] | undefined {
    return this.getCurrentActiveRecords() || undefined;
  }

  public set activeRecords(activeRecords: ActiveRecord[] | undefined) {
    this.setCurrentActiveRecords(activeRecords);
  }

  public reloadActiveRecords(records: ActiveRecords | undefined) {
    this.setCurrentActiveRecords(records);
  }

  public deleteDataSource(recordIndexes: number[]) {
    const { subviewSubmitCache } = this;
    if (subviewSubmitCache) {
      ActiveRecordsOperator.operator(this.dataSource, subviewSubmitCache).delete(recordIndexes);
    }
    super.deleteDataSource(recordIndexes);
  }

  public deleteDataSourceByEntity(records: ActiveRecords, predict?: DeleteActiveRecordsByEntityPredict) {
    const { subviewSubmitCache } = this;
    if (subviewSubmitCache) {
      ActiveRecordsOperator.operator(this.dataSource, subviewSubmitCache).deleteByEntity(records, predict);
    }
    super.deleteDataSourceByEntity(records, predict);
  }

  public async afterTriggerExecute(trigger: WidgetTrigger) {
    await super.afterTriggerExecute(trigger);

    this.refreshCallChaining?.syncCall();
  }

  public flushDataSource(reloadDataSource = true) {
    const { dataSource, submitCache, subviewSubmitCache } = this;
    let showRecords = dataSource;
    if (submitCache) {
      showRecords = submitCache.submit(dataSource || []);
    }
    if (subviewSubmitCache) {
      subviewSubmitCache.submit(dataSource || []);
    }
    reloadDataSource && this.reloadDataSource(showRecords);
    this.change(showRecords);

    this.repairTablePagination();
  }

  protected repairTablePagination() {
    const tableViewWidget = this.getChildrenWidget().find((w) => w.constructor.name == 'TableView');
    if (!tableViewWidget) {
      return;
    }
    const tableWidget = tableViewWidget.getChildrenWidget().find((w) => w.constructor.name == 'TableWidget');
    (tableWidget as any)?.repairPaginationAfterDelete();
  }

  protected defaultComputeTrigger: ComputeTrigger[] = [ComputeTrigger.CHANGE];

  protected defaultConstructDataTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  protected defaultClearFieldsTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  protected async mountedProcess() {
    await this.initSubviewData();
  }

  protected async refreshParentProcess() {
    await this.initSubviewData();
  }

  protected async refreshValueProcess() {
    await this.initSubviewData();
    this.refreshCallChaining?.syncCall();
  }

  protected initSubviewData(): ReturnPromise<void> {
    let currentValues = this.value;
    if (currentValues == null) {
      currentValues = [];
    }
    this.reloadDataSource(currentValues);
  }
}
