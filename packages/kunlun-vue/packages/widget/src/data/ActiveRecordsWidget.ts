import {
  ActiveRecord,
  ActiveRecords,
  ActiveRecordsOperator,
  DeleteActiveRecordsByEntityFunction,
  DeleteActiveRecordsByEntityPredict,
  DeleteActiveRecordsFunction,
  FlushActiveRecordsFunction,
  PushActiveRecordsFunction,
  PushActiveRecordsPredict,
  ReloadActiveRecordsFunction,
  RuntimeRelationField,
  SubmitCacheManager,
  UpdateActiveRecordsByEntityFunction,
  UpdateActiveRecordsByEntityPredict,
  UpdateActiveRecordsFunction,
  UpdateEntity
} from '@kunlun/engine';
import { Widget } from '../basic';
import { PathWidget, PathWidgetProps } from './PathWidget';

export interface ActiveRecordsWidgetProps extends PathWidgetProps {
  dataSource?: ActiveRecords | null;
  activeRecords?: ActiveRecords;
}

/**
 * 数据记录组件
 */
export class ActiveRecordsWidget<
  Props extends ActiveRecordsWidgetProps = ActiveRecordsWidgetProps
> extends PathWidget<Props> {
  public initialize(props: Props) {
    super.initialize(props);
    const { dataSource, activeRecords } = props;
    this.setCurrentDataSource(dataSource);
    this.setCurrentActiveRecords(activeRecords);
    return this;
  }

  /**
   * 提交缓存管理器
   * @protected
   */
  protected get submitCache(): SubmitCacheManager | undefined {
    return (this.metadataRuntimeContext.field as RuntimeRelationField | undefined)?.submitCache;
  }

  /**
   * 上级根数据
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject('rootData')
  protected parentRootData: ActiveRecord[] | undefined;

  /**
   * 当前根数据
   * @protected
   */
  @Widget.Reactive()
  private currentRootData: ActiveRecord[] | undefined;

  /**
   * 提供给下级的根数据
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  public get rootData(): ActiveRecord[] | undefined {
    return this.currentRootData || this.parentRootData;
  }

  public set rootData(rootData: ActiveRecord[] | undefined) {
    this.currentRootData = rootData;
  }

  public getCurrentRootData(): ActiveRecord[] | undefined {
    return this.currentRootData;
  }

  public setCurrentRootData(rootData: ActiveRecords | undefined) {
    this.currentRootData = ActiveRecordsOperator.repairRecordsNullable(rootData);
  }

  @Widget.Method()
  @Widget.Inject('reloadRootData')
  protected parentReloadRootData: ReloadActiveRecordsFunction | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  public reloadRootData(records: ActiveRecords | undefined) {
    if (this.parentReloadRootData && this.currentRootData === undefined) {
      this.parentReloadRootData(records);
    } else {
      this.setCurrentRootData(records);
    }
  }

  /**
   * 上级数据源
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject('dataSource')
  protected parentDataSource: ActiveRecord[] | undefined;

  /**
   * 当前数据源
   * @protected
   */
  @Widget.Reactive()
  private currentDataSource: ActiveRecord[] | null | undefined;

  /**
   * 提供给下级的数据源
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  public get dataSource(): ActiveRecord[] | undefined {
    return this.currentDataSource || this.parentDataSource;
  }

  public set dataSource(dataSource: ActiveRecord[] | undefined) {
    this.currentDataSource = dataSource;
  }

  public getCurrentDataSource(): ActiveRecord[] | null | undefined {
    return this.currentDataSource;
  }

  public setCurrentDataSource(dataSource: ActiveRecords | null | undefined) {
    this.currentDataSource = ActiveRecordsOperator.repairRecordsNullable(dataSource as ActiveRecords);
    if (!this.parentRootData) {
      this.currentRootData = this.currentDataSource || undefined;
    }
  }

  @Widget.Method()
  @Widget.Inject('reloadDataSource')
  protected parentReloadDataSource: ReloadActiveRecordsFunction | undefined;

  /**
   * 重新加载数据源到当前数据源中
   * <pre>
   * @Widget.Method()
   * @Widget.Inject()
   * private reloadDataSource: ReloadActiveRecordsFunction | undefined;
   * </pre>
   *
   * @param records 数据
   */
  @Widget.Method()
  @Widget.Provide()
  public reloadDataSource(records: ActiveRecords | undefined) {
    if (this.parentReloadDataSource && this.getCurrentDataSource() === undefined) {
      this.parentReloadDataSource(records);
    } else {
      this.setCurrentDataSource(records);
    }
  }

  @Widget.Method()
  @Widget.Inject('pushDataSource')
  protected parentPushDataSource: PushActiveRecordsFunction | undefined;

  /**
   * 添加数据源到当前数据源中
   * <pre>
   * @Widget.Method()
   * @Widget.Inject()
   * private pushDataSource: PushActiveRecordsFunction | undefined;
   * </pre>
   *
   * @param records 数据
   * @param predict 推送判定
   */
  @Widget.Method()
  @Widget.Provide()
  public pushDataSource(records: ActiveRecords, predict?: PushActiveRecordsPredict) {
    if (this.parentPushDataSource && this.getCurrentDataSource() === undefined) {
      this.parentPushDataSource(records, predict);
    } else {
      let pushPredict: PushActiveRecordsPredict | undefined = predict;
      const { submitCache } = this;
      if (submitCache && !pushPredict) {
        pushPredict = ActiveRecordsOperator.defaultPushPredict.bind(submitCache);
      }
      const nextDataSource = ActiveRecordsOperator.operator(this.getCurrentDataSource() || undefined, this.submitCache)
        .push(records, pushPredict)
        .get();
      if (!submitCache) {
        this.setCurrentDataSource(nextDataSource);
      }
    }
  }

  @Widget.Method()
  @Widget.Inject('updateDataSource')
  protected parentUpdateDataSource: UpdateActiveRecordsFunction | undefined;

  /**
   * 根据索引更新数据源
   * <pre>
   * @Widget.Method()
   * @Widget.Inject()
   * private updateDataSource: UpdateActiveRecordsFunction | undefined;
   * </pre>
   *
   * @param records 数据
   */
  @Widget.Method()
  @Widget.Provide()
  public updateDataSource(records: UpdateEntity[]) {
    if (this.parentUpdateDataSource && this.getCurrentDataSource() === undefined) {
      this.parentUpdateDataSource(records);
    } else {
      const nextDataSource = ActiveRecordsOperator.operator(this.getCurrentDataSource() || undefined, this.submitCache)
        .update(records)
        .get();
      if (!this.submitCache) {
        this.setCurrentDataSource(nextDataSource);
      }
    }
  }

  @Widget.Method()
  @Widget.Inject('updateDataSourceByEntity')
  protected parentUpdateDataSourceByEntity: UpdateActiveRecordsByEntityFunction | undefined;

  /**
   * 根据数据更新数据源
   * <pre>
   * @Widget.Method()
   * @Widget.Inject()
   * private updateDataSourceByEntity: UpdateDataSourceByEntityFunction | undefined;
   * </pre>
   *
   * @param records 数据
   * @param predict 更新判定
   */
  @Widget.Method()
  @Widget.Provide()
  public updateDataSourceByEntity(records: ActiveRecords, predict?: UpdateActiveRecordsByEntityPredict) {
    if (this.parentUpdateDataSourceByEntity && this.getCurrentDataSource() === undefined) {
      this.parentUpdateDataSourceByEntity(records, predict);
    } else {
      const nextDataSource = ActiveRecordsOperator.operator(this.getCurrentDataSource() || undefined, this.submitCache)
        .updateByEntity(records, predict)
        .get();
      if (!this.submitCache) {
        this.setCurrentDataSource(nextDataSource);
      }
    }
  }

  @Widget.Method()
  @Widget.Inject('deleteDataSource')
  protected parentDeleteDataSource: DeleteActiveRecordsFunction | undefined;

  /**
   * 根据索引删除数据源
   * <pre>
   * @Widget.Method()
   * @Widget.Inject()
   * private deleteDataSource: DeleteActiveRecordsFunction | undefined;
   * </pre>
   *
   * @param recordIndexes 数据
   */
  @Widget.Method()
  @Widget.Provide()
  public deleteDataSource(recordIndexes: number[]) {
    if (this.parentDeleteDataSource && this.getCurrentDataSource() === undefined) {
      this.parentDeleteDataSource(recordIndexes);
    } else {
      const nextDataSource = ActiveRecordsOperator.operator(this.getCurrentDataSource() || undefined, this.submitCache)
        .delete(recordIndexes)
        .get();
      if (!this.submitCache) {
        this.setCurrentDataSource(nextDataSource);
      }
    }
  }

  @Widget.Method()
  @Widget.Inject('deleteDataSourceByEntity')
  protected parentDeleteDataSourceByEntity: DeleteActiveRecordsByEntityFunction | undefined;

  /**
   * 根据数据删除数据源
   * <pre>
   * @Widget.Method()
   * @Widget.Inject()
   * private deleteDataSourceByEntity: DeleteDataSourceByEntityFunction | undefined;
   * </pre>
   *
   * @param records 数据
   * @param predict 删除判定
   */
  @Widget.Method()
  @Widget.Provide()
  public deleteDataSourceByEntity(records: ActiveRecords, predict?: DeleteActiveRecordsByEntityPredict) {
    if (this.parentDeleteDataSourceByEntity && this.getCurrentDataSource() === undefined) {
      this.parentDeleteDataSourceByEntity(records, predict);
    } else {
      const nextDataSource = ActiveRecordsOperator.operator(this.getCurrentDataSource() || undefined, this.submitCache)
        .deleteByEntity(records, predict)
        .get();
      if (!this.submitCache) {
        this.setCurrentDataSource(nextDataSource);
      }
    }
  }


  @Widget.Method()
  @Widget.Inject('createDataSourceByEntity')
  protected parentCreateDataSourceByEntity: PushActiveRecordsFunction | undefined;


  @Widget.Method()
  @Widget.Provide()
  public createDataSourceByEntity(records:ActiveRecords,predict?:PushActiveRecordsPredict){
    if (this.parentCreateDataSourceByEntity && this.getCurrentDataSource() === undefined) {
      this.parentCreateDataSourceByEntity(records, predict);
    } else {
      const nextDataSource = Array.isArray(records) ? records : [records];
      const oldDataSource = this.getCurrentDataSource() || [];
      this.setCurrentDataSource([...nextDataSource, ...oldDataSource]);
    }
  }

  @Widget.Method()
  @Widget.Inject('flushDataSource')
  protected parentFlushDataSource: FlushActiveRecordsFunction | undefined;

  /**
   * 刷新数据源（数据向上提交）
   * <pre>
   * @Widget.Method()
   * @Widget.Inject()
   * private flushActiveRecords: FlushActiveRecordsFunction | undefined;
   * </pre>
   */
  @Widget.Method()
  @Widget.Provide()
  public flushDataSource() {
    this.parentFlushDataSource?.();
  }

  /**
   * 上级数据记录，不可直接修改，仅在挂载时加载到当前数据记录
   */
  @Widget.Reactive()
  @Widget.Inject('activeRecords')
  protected parentActiveRecords: ActiveRecord[] | undefined;

  /**
   * 上级视图数据
   */
  @Widget.Reactive()
  @Widget.Inject('parentViewActiveRecords')
  protected parentViewActiveRecords: ActiveRecord[] | undefined;

  /**
   * 当前数据记录，不存在时将进行数据透传
   */
  @Widget.Reactive()
  private currentActiveRecords: ActiveRecord[] | undefined;

  /**
   * 提供给下级的数据记录
   */
  @Widget.Reactive()
  @Widget.Provide()
  public get activeRecords(): ActiveRecord[] | undefined {
    return this.currentActiveRecords || this.parentActiveRecords;
  }

  public set activeRecords(activeRecords: ActiveRecord[] | undefined) {
    this.currentActiveRecords = activeRecords;
  }

  public getCurrentActiveRecords(): ActiveRecord[] | undefined {
    return this.currentActiveRecords;
  }

  public setCurrentActiveRecords(activeRecords: ActiveRecords | undefined) {
    if (activeRecords === this.currentActiveRecords) {
      return;
    }

    this.currentActiveRecords = ActiveRecordsOperator.repairRecordsNullable(activeRecords);
  }

  @Widget.Method()
  @Widget.Inject('reloadActiveRecords')
  protected parentReloadActiveRecords: ReloadActiveRecordsFunction | undefined;

  /**
   * 重新加载数据记录到当前数据记录中
   * <pre>
   * @Widget.Method()
   * @Widget.Inject()
   * private reloadActiveRecords: ReloadActiveRecordsFunction | undefined;
   * </pre>
   *
   * @param records 数据
   */
  @Widget.Method()
  @Widget.Provide()
  public reloadActiveRecords(records: ActiveRecords | undefined) {
    if (this.parentReloadActiveRecords && this.getCurrentDataSource() === undefined) {
      this.parentReloadActiveRecords(records);
    } else {
      this.setCurrentActiveRecords(records);
    }
  }

  @Widget.Method()
  @Widget.Inject('pushActiveRecords')
  protected parentPushActiveRecords: PushActiveRecordsFunction | undefined;

  /**
   * 添加数据记录到当前数据记录中
   * <pre>
   * @Widget.Method()
   * @Widget.Inject()
   * private pushActiveRecords: PushActiveRecordsFunction | undefined;
   * </pre>
   *
   * @param records 数据
   * @param predict 推送判定
   */
  @Widget.Method()
  @Widget.Provide()
  public pushActiveRecords(records: ActiveRecords, predict?: PushActiveRecordsPredict) {
    if (this.parentPushActiveRecords && this.getCurrentDataSource() === undefined) {
      this.parentPushActiveRecords(records, predict);
    } else {
      this.currentActiveRecords = ActiveRecordsOperator.operator(this.currentActiveRecords)
        .push(records, predict)
        .get();
    }
  }

  @Widget.Method()
  @Widget.Inject('updateActiveRecords')
  protected parentUpdateActiveRecords: UpdateActiveRecordsFunction | undefined;

  /**
   * 根据索引更新数据记录
   * <pre>
   * @Widget.Method()
   * @Widget.Inject()
   * private updateActiveRecords: UpdateActiveRecordsFunction | undefined;
   * </pre>
   *
   * @param records 数据
   */
  @Widget.Method()
  @Widget.Provide()
  public updateActiveRecords(records: UpdateEntity[]) {
    if (this.parentUpdateActiveRecords && this.getCurrentDataSource() === undefined) {
      this.parentUpdateActiveRecords(records);
    } else {
      this.currentActiveRecords = ActiveRecordsOperator.operator(this.currentActiveRecords).update(records).get();
    }
  }

  @Widget.Method()
  @Widget.Inject('updateActiveRecordsByEntity')
  protected parentUpdateActiveRecordsByEntity: UpdateActiveRecordsByEntityFunction | undefined;

  /**
   * 根据数据更新数据记录
   * <pre>
   * @Widget.Method()
   * @Widget.Inject()
   * private updateActiveRecordsByEntity: UpdateActiveRecordsByEntityFunction | undefined;
   * </pre>
   *
   * @param records 数据
   * @param updatePredict 更新判定
   */
  @Widget.Method()
  @Widget.Provide()
  public updateActiveRecordsByEntity(records: ActiveRecords, updatePredict?: UpdateActiveRecordsByEntityPredict) {
    if (this.parentUpdateActiveRecordsByEntity && this.getCurrentDataSource() === undefined) {
      this.parentUpdateActiveRecordsByEntity(records, updatePredict);
    } else {
      this.currentActiveRecords = ActiveRecordsOperator.operator(this.currentActiveRecords)
        .updateByEntity(records, updatePredict)
        .get();
    }
  }

  @Widget.Method()
  @Widget.Inject('deleteActiveRecords')
  protected parentDeleteActiveRecords: DeleteActiveRecordsFunction | undefined;

  /**
   * 根据索引删除数据记录
   * <pre>
   * @Widget.Method()
   * @Widget.Inject()
   * private deleteActiveRecords: DeleteActiveRecordsFunction | undefined;
   * </pre>
   *
   * @param recordIndexes 数据
   */
  @Widget.Method()
  @Widget.Provide()
  public deleteActiveRecords(recordIndexes: number[]) {
    if (this.parentDeleteActiveRecords && this.getCurrentDataSource() === undefined) {
      this.parentDeleteActiveRecords(recordIndexes);
    } else {
      this.currentActiveRecords = ActiveRecordsOperator.operator(this.currentActiveRecords).delete(recordIndexes).get();
    }
  }

  @Widget.Method()
  @Widget.Inject('deleteActiveRecordsByEntity')
  protected parentDeleteActiveRecordsByEntity: DeleteActiveRecordsByEntityFunction | undefined;

  /**
   * 根据数据删除数据记录
   * <pre>
   * @Widget.Method()
   * @Widget.Inject()
   * private deleteActiveRecordsByEntity: DeleteActiveRecordsByEntityFunction | undefined;
   * </pre>
   *
   * @param records 数据
   * @param predict 删除判定
   */
  @Widget.Method()
  @Widget.Provide()
  public deleteActiveRecordsByEntity(records: ActiveRecords, predict?: DeleteActiveRecordsByEntityPredict) {
    if (this.parentDeleteActiveRecordsByEntity && this.getCurrentDataSource() === undefined) {
      this.parentDeleteActiveRecordsByEntity(records, predict);
    } else {
      this.currentActiveRecords = ActiveRecordsOperator.operator(this.currentActiveRecords)
        .deleteByEntity(records, predict)
        .get();
    }
  }

  @Widget.Method()
  @Widget.Inject('flushActiveRecords')
  protected parentFlushActiveRecords: FlushActiveRecordsFunction | undefined;

  /**
   * 刷新数据记录（数据向上提交）
   * <pre>
   * @Widget.Method()
   * @Widget.Inject()
   * private flushActiveRecords: FlushActiveRecordsFunction | undefined;
   * </pre>
   */
  @Widget.Method()
  @Widget.Provide()
  public flushActiveRecords() {
    if (this.parentFlushActiveRecords && this.getCurrentDataSource() === undefined) {
      this.parentFlushActiveRecords();
    } else {
      this.currentActiveRecords = [];
    }
  }
}
