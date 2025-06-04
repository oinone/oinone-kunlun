import {
  ActiveRecord,
  ActiveRecords,
  ActiveRecordsOperator,
  DeleteActiveRecordsByEntityPredict,
  EventKeys,
  IPopupInstance,
  IPopupWidget,
  PopupManager,
  PushActiveRecordsPredict,
  RuntimeAction,
  UpdateActiveRecordsByEntityPredict,
  UpdateEntity,
  WidgetProps
} from '@oinone/kunlun-engine';
import { emitEvent } from '@oinone/kunlun-shared';
import { VueWidget, Widget } from '@oinone/kunlun-vue-widget';
import { isFunction } from 'lodash-es';
import { PopupEventHandle, PopupEventHandles } from '../../typing';

export abstract class StaticPopupWidget<Props extends WidgetProps = WidgetProps>
  extends VueWidget<Props>
  implements IPopupWidget<Props>
{
  private handlers: PopupEventHandle = { cancel: [], ok: [] };

  protected abstract getPopupScene(): string;

  @Widget.Reactive()
  @Widget.Provide()
  protected get popupScene(): string {
    return this.getPopupScene();
  }

  @Widget.Reactive()
  private visible = false;

  @Widget.Method()
  public onOk() {
    this.onNotify('ok');
  }

  @Widget.Method()
  public onCancel() {
    this.onNotify('cancel');
    if (!this.handlers.cancel.length) {
      this.onVisibleChange(false);
      return true;
    }
  }

  @Widget.Reactive()
  public get isVisible() {
    return this.visible;
  }

  public beforeClose;

  @Widget.Method()
  public async onVisibleChange<Action extends RuntimeAction = RuntimeAction>(visible: boolean, triggerAction?: Action) {
    if (!visible && isFunction(this.beforeClose)) {
      const canClose = await this.beforeClose(triggerAction);
      if (!canClose) {
        return;
      }
    }
    this.visible = visible;
    let popupInstance = this.findPopupInstance();
    if (popupInstance) {
      if (visible) {
        PopupManager.INSTANCE.open(popupInstance.key);
      } else {
        PopupManager.INSTANCE.close(popupInstance.key);
      }
    } else {
      popupInstance = {
        type: this.popupScene,
        key: this.getHandle(),
        initialConfig: {
          widget: this
        }
      };
      PopupManager.INSTANCE.push(popupInstance, visible);
    }
  }

  private onNotify(type: keyof PopupEventHandles) {
    this.handlers[type].forEach((fn) => emitEvent(fn)());
  }

  public on(type: keyof PopupEventHandles, handler: Function) {
    let queue = this.handlers[type];
    if (!queue) {
      queue = [];
      this.handlers[type] = queue;
    }
    queue.push(handler);
  }

  protected findPopupInstance(): IPopupInstance<Props> | undefined {
    const key = this.getHandle();
    return PopupManager.INSTANCE.getInstances(this.getPopupScene()).find((v) => v.key === key);
  }

  protected $$created() {
    super.$$created();
    const popupInstance = this.findPopupInstance();
    if (popupInstance) {
      PopupManager.INSTANCE.notifyHandler(EventKeys.created, popupInstance);
    }
  }

  public dispose() {
    super.dispose();
    const popupInstance = this.findPopupInstance();
    if (popupInstance) {
      PopupManager.INSTANCE.notifyHandler(EventKeys.dispose, popupInstance);
    }
  }

  // region independent data source properties

  @Widget.Reactive()
  private currentRootData: ActiveRecord[] | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  public get rootData(): ActiveRecord[] | undefined {
    return this.currentRootData;
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

  @Widget.Reactive()
  private currentDataSource: ActiveRecord[] | null | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  public get dataSource(): ActiveRecord[] | undefined {
    return this.getCurrentDataSource() || undefined;
  }

  public set dataSource(dataSource: ActiveRecord[] | undefined) {
    this.currentDataSource = dataSource;
  }

  public getCurrentDataSource(): ActiveRecord[] | null | undefined {
    return this.currentDataSource;
  }

  public setCurrentDataSource(dataSource: ActiveRecords | null | undefined) {
    this.currentDataSource = ActiveRecordsOperator.repairRecordsNullable(dataSource as ActiveRecords);
    this.currentRootData = this.currentDataSource || undefined;
  }

  @Widget.Method()
  @Widget.Provide()
  public reloadDataSource(records: ActiveRecords | undefined) {
    this.setCurrentDataSource(records);
  }

  @Widget.Method()
  @Widget.Provide()
  public pushDataSource(records: ActiveRecords, predict?: PushActiveRecordsPredict) {
    this.setCurrentDataSource(
      ActiveRecordsOperator.operator(this.getCurrentDataSource() || undefined)
        .push(records, predict)
        .get()
    );
  }

  @Widget.Method()
  @Widget.Provide()
  public updateDataSource(records: UpdateEntity[]) {
    this.setCurrentDataSource(
      ActiveRecordsOperator.operator(this.getCurrentDataSource() || undefined)
        .update(records)
        .get()
    );
  }

  @Widget.Method()
  @Widget.Provide()
  public updateDataSourceByEntity(records: ActiveRecords, predict?: UpdateActiveRecordsByEntityPredict) {
    this.setCurrentDataSource(
      ActiveRecordsOperator.operator(this.getCurrentDataSource() || undefined)
        .updateByEntity(records, predict)
        .get()
    );
  }

  @Widget.Method()
  @Widget.Provide()
  public deleteDataSource(recordIndexes: number[]) {
    this.setCurrentDataSource(
      ActiveRecordsOperator.operator(this.getCurrentDataSource() || undefined)
        .delete(recordIndexes)
        .get()
    );
  }

  @Widget.Method()
  @Widget.Provide()
  public deleteDataSourceByEntity(records: ActiveRecords, predict?: DeleteActiveRecordsByEntityPredict) {
    this.setCurrentDataSource(
      ActiveRecordsOperator.operator(this.getCurrentDataSource() || undefined)
        .deleteByEntity(records, predict)
        .get()
    );
  }

  @Widget.Method()
  @Widget.Provide()
  public flushDataSource() {
    // do nothing
  }

  @Widget.Reactive()
  private currentActiveRecords: ActiveRecord[] | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  public get activeRecords(): ActiveRecord[] | undefined {
    return this.getCurrentActiveRecords();
  }

  public set activeRecords(activeRecords: ActiveRecord[] | undefined) {
    this.currentActiveRecords = activeRecords;
  }

  public getCurrentActiveRecords(): ActiveRecord[] | undefined {
    return this.currentActiveRecords;
  }

  public setCurrentActiveRecords(activeRecords: ActiveRecords | undefined) {
    this.currentActiveRecords = ActiveRecordsOperator.repairRecordsNullable(activeRecords);
  }

  @Widget.Method()
  @Widget.Provide()
  public reloadActiveRecords(records: ActiveRecords | undefined) {
    this.setCurrentActiveRecords(records);
  }

  @Widget.Method()
  @Widget.Provide()
  public pushActiveRecords(records: ActiveRecords, predict?: PushActiveRecordsPredict) {
    this.currentActiveRecords = ActiveRecordsOperator.operator(this.currentActiveRecords).push(records, predict).get();
  }

  @Widget.Method()
  @Widget.Provide()
  public updateActiveRecords(records: UpdateEntity[]) {
    this.currentActiveRecords = ActiveRecordsOperator.operator(this.currentActiveRecords).update(records).get();
  }

  @Widget.Method()
  @Widget.Provide()
  public updateActiveRecordsByEntity(records: ActiveRecords, updatePredict?: UpdateActiveRecordsByEntityPredict) {
    this.currentActiveRecords = ActiveRecordsOperator.operator(this.currentActiveRecords)
      .updateByEntity(records, updatePredict)
      .get();
  }

  @Widget.Method()
  @Widget.Provide()
  public deleteActiveRecords(recordIndexes: number[]) {
    this.currentActiveRecords = ActiveRecordsOperator.operator(this.currentActiveRecords).delete(recordIndexes).get();
  }

  @Widget.Method()
  @Widget.Provide()
  public deleteActiveRecordsByEntity(records: ActiveRecords, predict?: DeleteActiveRecordsByEntityPredict) {
    this.currentActiveRecords = ActiveRecordsOperator.operator(this.currentActiveRecords)
      .deleteByEntity(records, predict)
      .get();
  }

  @Widget.Method()
  @Widget.Provide()
  public flushActiveRecords() {
    this.currentActiveRecords = [];
  }

  @Widget.Reactive()
  protected currentOpenerDataSource: ActiveRecord[] | undefined;

  @Widget.Reactive()
  protected get openerDataSource(): ActiveRecord[] | undefined {
    return this.currentOpenerDataSource;
  }

  @Widget.Reactive()
  protected currentOpenerActiveRecords: ActiveRecord[] | undefined;

  @Widget.Reactive()
  public get openerActiveRecords(): ActiveRecord[] | undefined {
    return this.currentOpenerActiveRecords;
  }

  // endregion
}
