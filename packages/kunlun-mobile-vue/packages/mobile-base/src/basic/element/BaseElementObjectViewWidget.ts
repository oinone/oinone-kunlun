import {
  ActiveRecord,
  ActiveRecordExtendKeys,
  ActiveRecords,
  ActiveRecordsOperator,
  getRefreshParameters,
  getValidatorParameters,
  OioProvider,
  QueryContext,
  QueryService,
  QueryVariables,
  SubmitValue
} from '@kunlun/engine';
import { FieldEventName, FieldEventNames, LifeCycleTypes } from '@kunlun/event';
import { ActionContextType, ModelType, ViewMode } from '@kunlun/meta';
import { Condition } from '@kunlun/request';
import {
  BooleanHelper,
  CallChaining,
  debugConsole,
  NumberHelper,
  ObjectUtils,
  Optional,
  StringHelper
} from '@kunlun/shared';
import { OioMessage } from '@kunlun/vue-ui-mobile-vant';
import { Widget } from '@kunlun/vue-widget';
import { isArray, isFunction, isNil, isPlainObject, isString } from 'lodash-es';
import { isValidatorError } from '../../typing';
import { validatorCallChainingCallAfterFn } from '../constant';
import { BaseFieldWidget, BaseView } from '../token';
import { HandlerEvent as FieldHandlerEvent } from '../token/BaseFieldWidget';
import { RefreshProcessFunction } from '../types';
import { BaseElementViewWidget, BaseElementViewWidgetProps } from './BaseElementViewWidget';
import { concatCondition } from './utils';

export interface BaseElementObjectViewWidgetProps extends BaseElementViewWidgetProps {
  submitCallChaining?: CallChaining<SubmitValue>;
  validatorCallChaining?: CallChaining<boolean>;
}

interface FieldWidgetEntity {
  widget: BaseFieldWidget;
  index: number;
}

export class BaseElementObjectViewWidget<
  Props extends BaseElementObjectViewWidgetProps = BaseElementObjectViewWidgetProps
> extends BaseElementViewWidget<Props> {
  @Widget.Reactive()
  protected currentSubmitCallChaining: CallChaining<SubmitValue> | undefined;

  /**
   * 数据提交
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get submitCallChaining(): CallChaining<SubmitValue> | undefined {
    return this.currentSubmitCallChaining || this.parentSubmitCallChaining;
  }

  @Widget.Reactive()
  protected currentValidatorCallChaining: CallChaining<boolean> | undefined;

  /**
   * 数据校验
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get validatorCallChaining(): CallChaining<boolean> | undefined {
    return this.currentValidatorCallChaining || this.parentValidatorCallChaining;
  }

  @Widget.Reactive()
  @Widget.Inject('cols')
  protected parentCols: number | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  public get cols() {
    let cols = NumberHelper.toNumber(this.getDsl().cols) as number | undefined;
    if (isNil(cols)) {
      cols = this.parentCols;
    }
    if (isNil(cols)) {
      cols = 1;
    }
    return cols;
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected get formData(): ActiveRecord {
    return this.activeRecords?.[0] || {};
  }

  @Widget.Reactive()
  protected enableScrollToErrorField = true;

  public getData() {
    return this.formData;
  }

  public setData(data: ActiveRecords | undefined) {
    this.setCurrentDataSource(data);
    this.activeRecords = this.dataSource;
  }

  /**
   * 加载函数命名空间
   * @protected
   * @deprecated 不允许手动设置函数命名空间
   */
  @Widget.Reactive()
  public get loadFunctionNamespace(): string {
    const namespace = this.getDsl().loadFunctionNamespace || this.viewAction?.resModel || this.model.model;
    if (namespace) {
      return namespace;
    }
    throw new Error(`Invalid load function namespace`);
  }

  @Widget.Reactive()
  public get loadFunctionFun(): string | undefined {
    return Optional.ofNullable(this.getDsl().load).orElse(this.viewAction?.load);
  }

  public initialize(props: Props) {
    super.initialize(props);
    this.currentSubmitCallChaining = props.submitCallChaining;
    this.currentValidatorCallChaining = props.validatorCallChaining;
    return this;
  }

  public async fetchData(condition?: Condition): Promise<ActiveRecord> {
    return ActiveRecordsOperator.repairRecords(
      await this.load(async () => {
        const finalCondition = this.generatorCondition(condition);
        const variables = this.generatorQueryVariables();
        const context = this.generatorQueryContext();
        let result: ActiveRecord;
        if (finalCondition) {
          result = await this.queryOneByWrapper(finalCondition, variables, context);
        } else {
          result = await this.queryData(variables, context);
        }
        return result;
      })
    )[0];
  }

  public generatorCondition(condition?: Condition): Condition | undefined {
    this.refreshCondition();
    const { filter, domain } = this;
    return concatCondition(filter, domain, condition);
  }

  public generatorQueryVariables(variables?: QueryVariables) {
    variables = { ...(variables || {}), ...(this.metadataRuntimeContext.view?.context || {}) };
    if (!variables.scene) {
      variables.scene = this.scene || this.getUrlParameters().action;
    }
    return this.rootRuntimeContext.generatorVariables(variables);
  }

  public generatorQueryContext(context?: QueryContext) {
    context = { ...(context || {}) };
    context.__queryParams = {
      ...(context.__queryParams || {}),
      scene: this.scene || this.getUrlParameters().action
    };
    return context;
  }

  public get useConstruct() {
    const { viewAction } = this;
    if (viewAction) {
      const { contextType, model, resModel } = viewAction;
      const { type: modelType } = this.model;
      return (
        model !== resModel ||
        (modelType && [ModelType.TRANSIENT].includes(modelType)) ||
        [ActionContextType.ContextFree, ActionContextType.SingleAndBatch, ActionContextType.Batch].includes(contextType)
      );
    }
    return true;
  }

  public async queryData(variables: QueryVariables, context: QueryContext): Promise<ActiveRecord> {
    const { useConstruct, initialValue, loadFunctionFun } = this;
    let result: ActiveRecord | undefined;
    let id: string | null | undefined;
    let ids: string[] | undefined;
    const contextType = this.viewAction?.contextType || ActionContextType.Single;
    if (this.inline) {
      switch (contextType) {
        case ActionContextType.Single:
          if (BooleanHelper.isFalse(loadFunctionFun)) {
            return initialValue?.[0] || {};
          }
          id = initialValue?.[0]?.id as string;
          break;
        case ActionContextType.SingleAndBatch:
        case ActionContextType.Batch:
          ids = initialValue?.map((v) => v.id).filter((v) => !!v) as string[];
          break;
      }
    } else {
      switch (contextType) {
        case ActionContextType.Single:
          id = this.urlParameters.id;
          break;
        case ActionContextType.SingleAndBatch:
        case ActionContextType.Batch:
          ids = this.urlParameters.ids?.split(StringHelper.ARRAY_DEFAULT_SEPARATOR);
          break;
      }
    }
    if (!useConstruct && (loadFunctionFun || id)) {
      this.testInitialContext();
      [result] = ActiveRecordsOperator.repairRecords(
        await this.queryOne(
          {
            id,
            ...(this.initialContext || {})
          },
          variables,
          context
        )
      );
    } else {
      let queryData: ActiveRecords | undefined;
      if (id) {
        queryData = { id };
      }
      if (ids) {
        queryData = ids.map((v) => ({ id: v } as ActiveRecord));
      }
      [result] = ActiveRecordsOperator.repairRecords(await this.queryConstruct(queryData, variables, context));
    }

    return result;
  }

  /**
   * 页面构造函数
   * @param queryData 查询数据
   * @param variables
   * @param context
   */
  public async queryConstruct(
    queryData: ActiveRecords | undefined,
    variables: QueryVariables,
    context: QueryContext
  ): Promise<ActiveRecord> {
    if (BooleanHelper.isFalse(this.loadFunctionFun)) {
      if (this.isExpandView()) {
        return this.activeRecords?.[0] || {};
      }
      return {};
    }
    const { viewAction } = this;
    let finalQueryData: ActiveRecords | undefined;
    let isSameModel = true;
    if (viewAction) {
      const { model: lastModel, contextType } = viewAction;
      const currentModel = this.model.model;
      if (currentModel && lastModel && currentModel !== lastModel) {
        isSameModel = false;
        switch (contextType) {
          case ActionContextType.Batch:
          case ActionContextType.SingleAndBatch:
            finalQueryData = this.initialValue;
            break;
          case ActionContextType.ContextFree:
            isSameModel = true;
            break;
        }
      }
    }
    if (!finalQueryData) {
      if (isArray(queryData)) {
        finalQueryData = queryData;
      } else {
        const viewInitialValue = await this.rootRuntimeContext.getInitialValue();
        const initialValue = this.initialValue?.[0] || {};
        this.testInitialContext();
        finalQueryData = {
          ...viewInitialValue,
          ...initialValue,
          ...(queryData || {}),
          ...(this.initialContext || {})
        };
      }
    }
    const requestFields = this.rootRuntimeContext.getRequestModelFields();
    return (
      (await QueryService.constructOne(this.model, finalQueryData, {
        requestFields,
        responseFields: requestFields,
        fun: this.loadFunctionFun,
        isSameModel,
        variables,
        context
      })) || {}
    );
  }

  protected testInitialContext() {
    debugConsole.run(() => {
      const context = this.initialContext || {};
      const requestFields = this.rootRuntimeContext.getRequestModelFields();
      const fieldNames = requestFields.map((field) => field?.field?.name);
      const validFields = Object.keys(context).filter((key) => !fieldNames.includes(key) && key !== 'isKeepAlive');
      if (validFields.length) {
        debugConsole.warn('当前页面的上下文中可能有未拖入到页面的字段', validFields);
      }
    });
  }

  /**
   * 页面查询函数
   * @param queryData
   * @param variables
   * @param context
   */
  public async queryOne(
    queryData: ActiveRecord,
    variables: QueryVariables,
    context: QueryContext
  ): Promise<ActiveRecord> {
    if (BooleanHelper.isFalse(this.loadFunctionFun)) {
      if (this.isExpandView()) {
        return this.activeRecords?.[0] || {};
      }
      return {};
    }
    const requestFields = this.rootRuntimeContext.getRequestModelFields();
    return (
      (await QueryService.queryOne(this.model, queryData, {
        requestFields,
        responseFields: requestFields,
        fun: this.loadFunctionFun,
        variables,
        context
      })) || {}
    );
  }

  /**
   * 页面条件查询函数
   * @param condition
   * @param variables
   * @param context
   */
  public async queryOneByWrapper(condition: Condition, variables: QueryVariables, context: QueryContext) {
    if (BooleanHelper.isFalse(this.loadFunctionFun)) {
      if (this.isExpandView()) {
        return this.activeRecords?.[0] || {};
      }
      return {};
    }
    const requestFields = this.rootRuntimeContext.getRequestModelFields();
    return (
      (await QueryService.queryOneByWrapper(this.model, {
        requestFields,
        responseFields: requestFields,
        fun: this.loadFunctionFun,
        condition,
        variables,
        context
      })) || {}
    );
  }

  public async submit(): Promise<SubmitValue | undefined> {
    if (this.submitCallChaining) {
      return this.submitCallChaining.syncCall();
    }
    return new SubmitValue(this.formData);
  }

  public async validator(): Promise<boolean> {
    if (this.validatorCallChaining) {
      const res = await this.validatorCallChaining.call();
      return res || false;
    }
    return true;
  }

  protected async mountedProcess() {
    let dataSource: ActiveRecords | undefined = this.dataSource;
    if (this.isDataSourceProvider || !dataSource || !!this.loadFunctionFun) {
      this.isDataSourceProvider = true;
      dataSource = await this.fetchData();
      this.reloadDataSource(dataSource);
    }
    this.reloadActiveRecords(dataSource);
    this.repairViewMode();
  }

  protected repairViewMode() {
    if (this.parentMountedCallChaining) {
      const currentId = this.formData.id as string | undefined;
      const optional = Optional.ofNullable(this.rootRuntimeContext.handle)
        .map((v) => Widget.select(v) as BaseView)
        .map((v) => v.getOperator<BaseView>());
      if (currentId) {
        optional.ifPresent((v) => {
          if (v.getViewMode() === ViewMode.Create) {
            this.setViewMode(ViewMode.Editor);
          }
        });
      } else {
        optional.ifPresent((v) => {
          if (v.getViewMode() === ViewMode.Editor) {
            v.setViewMode(ViewMode.Create);
          }
        });
      }
    }
  }

  @Widget.Method()
  @Widget.Inject('refreshProcess')
  protected parentRefreshProcess: RefreshProcessFunction | undefined;

  @Widget.Method()
  @Widget.Provide()
  protected async refreshProcess(condition?: Condition) {
    const { isDataSourceProvider } = this;
    let finalDataSource: ActiveRecords | undefined;
    if (isDataSourceProvider || (this.automatic && !this.parentRefreshProcess)) {
      finalDataSource = await this.fetchData(condition);
      this.reloadDataSource(finalDataSource);
    } else {
      await this.parentRefreshProcess?.(condition);
      finalDataSource = this.parentDataSource;
    }
    this.reloadActiveRecords(finalDataSource);
    this.repairViewMode();
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    if (!this.currentSubmitCallChaining && !this.parentSubmitCallChaining) {
      this.currentSubmitCallChaining = new CallChaining();
    }
    if (!this.currentValidatorCallChaining && !this.parentValidatorCallChaining) {
      this.currentValidatorCallChaining = new CallChaining();
    }
  }

  public $$mounted() {
    super.$$mounted();

    this.submitCallChaining?.callBefore(
      () => {
        const { formData } = this;
        const submitData: Record<string, unknown> = {};
        Object.values(ActiveRecordExtendKeys).forEach((key) => {
          ObjectUtils.safeSetter(submitData, formData, key);
        });
        return new SubmitValue(submitData);
      },
      { force: true, immutable: false }
    );

    this.validatorCallChaining?.callBefore(
      () => {
        this.notify(LifeCycleTypes.ON_VIEW_VALIDATE_START);
        return true;
      },
      { force: true, immutable: false }
    );

    this.validatorCallChaining?.callAfter(
      (args, callBeforeResult, callAfterResult) => {
        const res = validatorCallChainingCallAfterFn(args, callBeforeResult, callAfterResult);
        const { sendErrorMessage } = getValidatorParameters(args);
        if (res) {
          this.notify(LifeCycleTypes.ON_VIEW_VALIDATE_SUCCESS);
        } else {
          const validatorFieldWidget = this.getFieldWidgets(true).find((v) => {
            const info = v.validatorInfo;
            if (info) {
              return isValidatorError(info);
            }
            return false;
          });

          if (validatorFieldWidget) {
            if (sendErrorMessage) {
              const { validatorInfo: errorInfo } = validatorFieldWidget;
              if (errorInfo) {
                OioMessage.error(`${errorInfo.displayName || validatorFieldWidget.field?.label} ${errorInfo.message}`);
              }
            }

            this.tryScrollToFieldWidget(validatorFieldWidget);
          }

          this.notify(LifeCycleTypes.ON_VIEW_VALIDATE_FAILED);
        }
        this.notify(LifeCycleTypes.ON_VIEW_VALIDATE_END);
        return res;
      },
      { force: true, immutable: false }
    );
    if (this.parentMountedCallChaining && !this.inline) {
      // fixme @zbh 20221027 此处使用模型pks做初始化参数，可以处理创建页面和更新页面使用id表达式的抖动问题
      const initActiveRecord: Record<string, unknown> = {};
      const { id } = this.urlParameters;
      if (id) {
        initActiveRecord.id = id;
        this.reloadActiveRecords([initActiveRecord]);
      }
    }
  }

  protected async $$executeRefreshCallChaining(args: unknown[] | undefined): Promise<void> {
    const { condition } = getRefreshParameters(args);
    await this.refreshProcess(condition);
  }

  protected fieldWidgetMap: Map<string, FieldWidgetEntity> = new Map();

  protected tryScrollToFieldWidget(fieldWidget: BaseFieldWidget) {
    const { enableScrollToErrorField } = OioProvider.getConfig();
    if (!enableScrollToErrorField || !this.enableScrollToErrorField) {
      return;
    }

    const el = document.querySelector(`[data-name="${fieldWidget.itemData}"]`);
    el && el.scrollIntoView();
  }

  @Widget.Method()
  @Widget.Provide()
  protected fieldWidgetMounted(widget: BaseFieldWidget) {
    this.fieldWidgetMap.set(widget.path, {
      widget,
      index: this.fieldWidgetMap.size
    });
  }

  @Widget.Method()
  @Widget.Provide()
  protected fieldWidgetUnmounted(widget: BaseFieldWidget) {
    this.fieldWidgetMap.delete(widget.path);
  }

  public getFieldWidgets(sort = false): BaseFieldWidget[] {
    const iterator = this.fieldWidgetMap.values();
    let next = iterator.next();
    if (sort) {
      const fieldWidgets: FieldWidgetEntity[] = [];
      while (!next.done) {
        fieldWidgets.push(next.value);
        next = iterator.next();
      }
      return fieldWidgets.sort((a, b) => a.index - b.index).map((v) => v.widget);
    }
    const fieldWidgets: BaseFieldWidget[] = [];
    while (!next.done) {
      fieldWidgets.push(next.value.widget);
      next = iterator.next();
    }
    return fieldWidgets;
  }

  /**
   * 监听form内部字段的事件, 依次传参
   *
   * @param {string | string[] | '*'} field 字段的field ，如果是 "*" 那么就会监听所有的字段
   * @param {FieldEventName} eventName 事件名
   * @param {Function} callback 事件触发的回调函数
   *
   * @example
   * formWidget.onFieldEvent('field', 'change', (fieldInstance) => {})
   */
  public onFieldEvent(field: string | string[] | '*', eventName: FieldEventName, callback: FieldHandlerEvent);

  /**
   * 监听form内部字段的事件, 事件对象参数
   *
   * @param {string | string[] | '*'} field 字段的field ，如果是 "*" 那么就会监听所有的字段
   * @param {Object} eventName 事件对象
   *
   * @example
   * formWidget.onFieldEvent('field', { change(fieldInstance) { }})
   */
  public onFieldEvent(field: string | string[] | '*', eventName: { [key in FieldEventName]?: FieldHandlerEvent });

  public onFieldEvent(
    field: string | string[] | '*',
    eventName: FieldEventName | { [key in FieldEventName]?: FieldHandlerEvent },
    callback?: FieldHandlerEvent
  ) {
    if (!isString(field) && !isArray(field)) {
      return;
    }

    let handlers: { [key in FieldEventName]?: FieldHandlerEvent };

    if (isString(eventName)) {
      if (!(FieldEventNames[eventName] && isFunction(callback))) {
        return;
      }

      handlers = {
        [eventName]: callback
      };
    } else {
      if (!isPlainObject(eventName)) {
        return;
      }

      handlers = eventName;
    }

    const fieldWidgets = this.getFieldWidgets();

    const addFieldEvent = (fieldName: string) => {
      const fieldWidget = fieldWidgets.find((f) => f.itemData === fieldName);
      if (fieldWidget) {
        fieldWidget.on(handlers);
      }
    };

    if (field === '*') {
      fieldWidgets.forEach((f) => {
        f.on(handlers);
      });
    } else if (isArray(field)) {
      field.forEach((fieldName) => {
        addFieldEvent(fieldName);
      });
    } else {
      addFieldEvent(field);
    }
  }
}
