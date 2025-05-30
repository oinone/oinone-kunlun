import { DslDefinition } from '@kunlun/dsl';
import {
  ActiveRecord,
  ActiveRecordsOperator,
  computeViewMode,
  PushActiveRecordsPredict,
  resolveDynamicDomain,
  RuntimeContext,
  RuntimeView,
  RuntimeViewAction,
  SubmitCacheManager,
  translateValueByKey,
  UpdateActiveRecordsByEntityPredict
} from '@kunlun/engine';
import { Expression, ExpressionRunParam } from '@kunlun/expression';
import { ActionContextType, ViewMode, ViewType } from '@kunlun/meta';
import { debugConsole, ReturnPromise } from '@kunlun/shared';
import { OioNotification } from '@kunlun/vue-ui-antd';
import { Widget } from '@kunlun/vue-widget';
import { cloneDeep } from 'lodash-es';
import { MetadataViewWidget } from '../../../basic';
import { ClickResult, PopupSubmitParameters } from '../../../typing';
import { ViewActionWidget } from '../ViewActionWidget';
import { PopupLoadDataResult } from './typing';
import { createPopupDslDefinition, PopupDslDefinition, seekPopupDslDefinition } from './util';

export abstract class PopupActionWidget extends ViewActionWidget {
  protected metadataSubviewWidget: MetadataViewWidget | undefined;

  protected subviewRuntimeContext: RuntimeContext | undefined;

  @Widget.Reactive()
  protected popupViewDslNode: DslDefinition | undefined;

  @Widget.Reactive()
  protected currentViewDslNode: DslDefinition | null | undefined;

  @Widget.Reactive()
  protected popupDslDefinition: PopupDslDefinition | null | undefined;

  protected defaultSubviewType = ViewType.Form;

  @Widget.Reactive()
  @Widget.Provide()
  protected get viewMode(): ViewMode {
    return this.computeViewMode(this.action);
  }

  @Widget.Reactive()
  protected get subviewType(): ViewType {
    return this.popupDslDefinition?.viewType || this.defaultSubviewType;
  }

  @Widget.Reactive()
  protected get subviewModel(): string {
    return this.popupDslDefinition?.resModel || super.model.model;
  }

  @Widget.Reactive()
  protected get subviewModelName(): string {
    return this.popupDslDefinition?.resModelName || super.model.name;
  }

  @Widget.Reactive()
  protected get subviewModule(): string | undefined {
    return this.popupDslDefinition?.resModule || super.model.module;
  }

  @Widget.Reactive()
  protected get subviewModuleName(): string {
    return this.popupDslDefinition?.resModuleName || super.model.moduleName;
  }

  @Widget.Reactive()
  protected currentOpenerDataSource: ActiveRecord[] | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected get openerDataSource(): ActiveRecord[] | undefined {
    return this.currentOpenerDataSource || this.parentOpenerDataSource;
  }

  @Widget.Reactive()
  protected currentOpenerActiveRecords: ActiveRecord[] | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  public get openerActiveRecords(): ActiveRecord[] | undefined {
    return this.currentOpenerActiveRecords || this.parentOpenerActiveRecords;
  }

  public initialize(props) {
    super.initialize(props);
    const { popupViewDslNode, currentViewDslNode } = seekPopupDslDefinition(this.getDsl());
    this.popupViewDslNode = popupViewDslNode;
    this.currentViewDslNode = currentViewDslNode;
    return this;
  }

  @Widget.Method()
  @Widget.Provide()
  public onSubmit(parameters: PopupSubmitParameters) {
    const { showRecords, submitRecords } = parameters;
    if (showRecords) {
      showRecords.forEach((a) => {
        a.__lastUpdateFromLocal = true;
        a.__updateTimestamp = `${new Date().getTime()}`;
      });
    }
    const contextType = this.action?.contextType as ActionContextType;
    if (contextType) {
      switch (contextType) {
        case ActionContextType.Single:
          this.updateDataSourceByEntityForSubmit({ showRecords: [showRecords[0]], submitRecords: submitRecords[0] });
          break;
        case ActionContextType.Batch:
        case ActionContextType.SingleAndBatch:
          this.updateDataSourceByEntityForSubmit({ showRecords, submitRecords });
          break;
        case ActionContextType.ContextFree:
          this.pushDataSourceForSubmit({ showRecords, submitRecords });
          break;
        default:
          throw new Error(`Invalid context type. value = ${contextType}`);
      }
      this.flushDataSource();
      return true;
    }
    return false;
  }

  protected updateDataSourceByEntityForSubmit(
    parameters: PopupSubmitParameters,
    predict?: UpdateActiveRecordsByEntityPredict
  ) {
    const { showRecords, submitRecords } = parameters;
    const subviewSubmitCache = this.metadataRuntimeContext.extendData.subviewSubmitCache as SubmitCacheManager;
    if (subviewSubmitCache) {
      ActiveRecordsOperator.operator(this.dataSource, subviewSubmitCache).updateByEntity(submitRecords, predict);
    }
    this.updateDataSourceByEntity(showRecords, predict);
  }

  protected pushDataSourceForSubmit(parameters: PopupSubmitParameters, predict?: PushActiveRecordsPredict) {
    const { showRecords, submitRecords } = parameters;
    const subviewSubmitCache = this.metadataRuntimeContext.extendData.subviewSubmitCache as SubmitCacheManager;
    if (subviewSubmitCache) {
      predict = predict || ActiveRecordsOperator.defaultPushPredict.bind(subviewSubmitCache);
      ActiveRecordsOperator.operator(this.dataSource, subviewSubmitCache).push(submitRecords, predict);
    }
    this.pushDataSource(showRecords, predict);
  }

  @Widget.Method()
  @Widget.Provide()
  public onCancel(parameters: PopupSubmitParameters) {
    return true;
  }

  protected async clickAction(...args: unknown[]): Promise<ClickResult> {
    debugConsole.group(`popupViewAction click:${this.action.model}:${this.action.name}:${this.action.label}`);
    await this.generatorPopupWidget();
    debugConsole.groupEnd();
    return true;
  }

  protected async generatorPopupWidget() {
    const popupDslDefinition = await this.generatorPopupDslDefinition();
    if (!popupDslDefinition) {
      return;
    }
    this.metadataSubviewWidget?.dispose();
    this.metadataSubviewWidget = undefined;
    this.loadOpenerData();
    const { data, isFetchData } = await this.loadData();
    if (!this.metadataSubviewWidget) {
      this.metadataSubviewWidget = this.createMetadataSubviewWidget();
    }
    this.initSubview(popupDslDefinition, data);
    this.createPopupWidget(data, isFetchData);
  }

  protected async generatorPopupDslDefinition() {
    const { action } = this;
    let { popupDslDefinition, currentViewDslNode } = this;
    if (currentViewDslNode === undefined) {
      currentViewDslNode = await this.getViewDsl();
      if (currentViewDslNode) {
        this.currentViewDslNode = currentViewDslNode;
      } else {
        this.currentViewDslNode = null;
      }
    }
    if (popupDslDefinition === undefined) {
      if (action) {
        popupDslDefinition = await createPopupDslDefinition(this.popupViewDslNode, currentViewDslNode, {
          ...action,
          label: this.label
        });
        if (popupDslDefinition) {
          this.popupDslDefinition = popupDslDefinition;
        } else {
          this.popupDslDefinition = null;
        }
      }
    }
    if (!popupDslDefinition) {
      OioNotification.error(translateValueByKey('错误'), translateValueByKey('未配置弹出层视图'));
      return;
    }
    return popupDslDefinition;
  }

  protected createMetadataSubviewWidget(): MetadataViewWidget {
    return this.createWidget(new MetadataViewWidget(), undefined, {
      metadataHandle: this.metadataHandle,
      rootHandle: this.rootHandle,
      internal: true,
      isVirtual: true,
      inline: true,
      automatic: true
    });
  }

  protected initSubview(popupDslDefinition: PopupDslDefinition, data: ActiveRecord[]) {
    const { viewDslNode, dslDefinition } = popupDslDefinition;
    const { action } = this;
    const resView: RuntimeView = {
      type: this.subviewType,
      model: this.subviewModel,
      modelName: this.subviewModelName,
      module: this.subviewModule,
      moduleName: this.subviewModuleName,
      dsl: viewDslNode,
      template: dslDefinition,
      initialValue: data,
      context: this.buildContext()
    };
    if (action) {
      const runtimeViewAction: RuntimeViewAction = {
        ...action,
        resViewType: this.subviewType,
        resModel: this.subviewModel,
        resModelName: this.subviewModelName,
        resModule: this.subviewModule,
        resModuleName: this.subviewModuleName,
        resViewMode: this.computeViewMode(action),
        resView
      };
      const { filter } = action;
      if (filter) {
        runtimeViewAction.filter = resolveDynamicDomain(
          filter,
          this.activeRecords?.[0] || {},
          this.rootData?.[0] || {},
          this.parentOpenerDataSource?.[0] || {},
          this.scene,
          this.parentViewActiveRecords?.[0] || {}
        );
      }
      if (this.actionDomain) {
        runtimeViewAction.domain = this.actionDomain;
      }
      this.subviewRuntimeContext = this.metadataSubviewWidget?.initContextByViewAction(runtimeViewAction);
    } else {
      this.subviewRuntimeContext = this.metadataSubviewWidget?.initContextByView(resView);
    }
    this.initSubviewAfterProperties();
  }

  protected computeViewMode(action: RuntimeViewAction): ViewMode {
    return computeViewMode(this.subviewType, action.contextType);
  }

  protected getViewLayout(): ReturnPromise<DslDefinition | undefined> {
    return undefined;
  }

  protected getViewDsl(): ReturnPromise<DslDefinition | undefined> {
    return this.popupDslDefinition?.viewDslNode;
  }

  protected getViewTemplate(): ReturnPromise<DslDefinition | undefined> {
    return undefined;
  }

  protected initSubviewAfterProperties() {}

  protected abstract createPopupWidget(data: ActiveRecord[], isFetchData: boolean): void;

  protected createPopupDslDefinition() {
    return this.popupDslDefinition?.dslDefinition;
  }

  /**
   * 加载
   * @protected
   */
  protected loadOpenerData() {
    this.currentOpenerDataSource = this.parentDataSource;
    this.currentOpenerActiveRecords = this.parentActiveRecords;
  }

  /**
   * 加载弹窗数据
   * @protected
   */
  protected loadData(): ReturnPromise<PopupLoadDataResult> {
    const viewType = this.popupDslDefinition?.viewType;
    if (!viewType) {
      return { data: [], isFetchData: true };
    }
    const contextType = this.action?.contextType;
    if (!contextType) {
      return { data: [], isFetchData: true };
    }
    const isObject = [ViewType.Form, ViewType.Detail].includes(viewType);
    let data: ActiveRecord[];
    let isFetchData: boolean;
    switch (contextType) {
      case ActionContextType.Single:
        data = [cloneDeep(this.activeRecords?.[0] || {})];
        isFetchData = false;
        break;
      case ActionContextType.Batch:
      case ActionContextType.SingleAndBatch:
        data = cloneDeep(this.activeRecords || []);
        isFetchData = false;
        break;
      case ActionContextType.ContextFree:
        if (isObject) {
          data = [{}];
        } else {
          data = [];
        }
        isFetchData = true;
        break;
      default:
        throw new Error(`Invalid context type. value = ${contextType}`);
    }
    return {
      data,
      isFetchData
    };
  }

  /**
   * 是否通过弹窗中的组件自动获取数据
   * @param records loadData返回值
   * @return true 自动获取 false 填充loadData返回值 undefined 根据action自动判断
   * @protected
   */
  protected isFetchData(records: ActiveRecord[]): boolean | undefined {
    return undefined;
  }

  // 单行动作调用fetchData的场景
  // 1.新增数据(!records || !records[0])
  // 2.数据最后一次本地编辑过的
  // 3.数据没有id FIXME 传输模型本来就没有id，可能有隐患
  protected isNotNeedFetchData(records: ActiveRecord[], contextType: ActionContextType): boolean {
    return (
      contextType === ActionContextType.Single &&
      (!records || !records[0] || !!records[0].__lastUpdateFromLocal || !records[0]?.id)
    );
  }

  public executeExpression<T>(expression: string, errorValue?: T): string | T | undefined {
    const activeRecords = this.activeRecords || [];
    const scene = this.scene;
    return Expression.run(
      {
        activeRecords,
        rootRecord: this.rootData?.[0] || {},
        openerRecord: this.parentOpenerActiveRecords?.[0] || {},
        scene,
        activeRecord: activeRecords[0] || {}
      } as ExpressionRunParam,
      expression,
      errorValue
    );
  }
}
