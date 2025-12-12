import { DEFAULT_SLOT_NAME, DslDefinition, DslDefinitionType } from '@oinone/kunlun-dsl';
import {
  ActiveRecord,
  ActiveRecords,
  activeRecordsClone,
  ActiveRecordsOperator,
  formValidateErrorProcess,
  FunctionCache,
  FunctionMetadata,
  FunctionService,
  GroupingField,
  isRelation2MField,
  KeyboardConfig,
  parseConfigs,
  RuntimeAction,
  RuntimeFunctionDefinition,
  RuntimeM2MField,
  RuntimeO2MField,
  SubmitCacheManager,
  SubmitValue,
  TableKeyboardConfig,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { Expression, ExpressionRunParam } from '@oinone/kunlun-expression';
import { HttpClientError, MessageHub } from '@oinone/kunlun-request';
import { EDirection, ISort } from '@oinone/kunlun-service';
import { BooleanHelper, Optional, ReturnPromise, StringHelper } from '@oinone/kunlun-shared';
import {
  ActiveEditorContext,
  CheckedChangeEvent,
  GROUP_TREE_KEY,
  OioTableInstance,
  RowContext,
  TableEditorCloseTrigger,
  TableEditorMode,
  TableEditorTrigger,
  VxeTableHelper
} from '@oinone/kunlun-vue-ui';
import { ListSelectMode, OioNotification, StyleHelper } from '@oinone/kunlun-vue-ui-antd';
import { isTableViewState, OioAnyViewState, OioTableViewState, Widget } from '@oinone/kunlun-vue-widget';
import { cloneDeep, isEmpty, isEqual, isNil, isPlainObject, omitBy, toString } from 'lodash-es';
import { nextTick } from 'vue';
import { VxeTablePropTypes } from 'vxe-table';
import {
  BaseTableEvent,
  TableAddEvent,
  TableCopyEvent,
  TableEditEvent,
  TableEventCallChaining,
  TableEventType
} from '../../typing';
import { FetchUtil } from '../../util';
import { BaseElementListViewWidget, BaseElementListViewWidgetProps, getSortFieldDirection } from '../element';
import { BaseTableColumnWidget } from '../table-column';
import { FieldWidgetComponentFunction, IFormSubviewListFieldWidget, UrlQueryParameters } from '../types';

interface ColumnWidgetEntity {
  widget: BaseTableColumnWidget;
  index: number;
}

export interface TableBindingKeyboardConfig {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  fn: (e: KeyboardEvent) => void;
}

const URL_SPLIT_SEPARATOR = ',';
const ORDERING_SEPARATOR = ',';
const ORDERING_FIELD_ORDER_SEPARATOR = ' ';
const DEFAULT_ORDERING_ORDER = EDirection.ASC;

export class BaseTableWidget<
  Props extends BaseElementListViewWidgetProps = BaseElementListViewWidgetProps
> extends BaseElementListViewWidget<Props> {
  protected tableInstance: OioTableInstance | undefined;

  public getTableInstance() {
    return this.tableInstance;
  }

  @Widget.Method()
  protected setTableInstance(tableInstance: OioTableInstance | undefined) {
    this.tableInstance = tableInstance;
  }

  protected get tableConfig() {
    return this.getMergeConfig('table');
  }

  @Widget.Method()
  @Widget.Provide()
  protected getFieldWidgetComponent: FieldWidgetComponentFunction | undefined;

  public reloadActiveRecords(records: ActiveRecords | undefined) {
    super.reloadActiveRecords(records);
    this.reloadTableInstanceActiveRecords();
  }

  protected reloadTableInstanceActiveRecords() {
    switch (this.selectMode) {
      case ListSelectMode.checkbox:
        this.tableInstance?.resetCheckboxRow(this.activeRecords || []);
        break;
      case ListSelectMode.radio: {
        const record = this.activeRecords?.[0];
        if (record) {
          this.tableInstance?.setRadioRow(record);
        } else {
          this.tableInstance?.clearRadioRow();
        }
        break;
      }
    }
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected expandContext: Record<string, unknown> | undefined;

  public initialize(props: Props) {
    if (!props.slotNames) {
      props.slotNames = [DEFAULT_SLOT_NAME];
    }
    super.initialize(props);
    const { expandContext } = parseConfigs(props, { key: 'expandContext', prefix: 'expandContext' });
    this.expandContext = expandContext;
    return this;
  }

  @Widget.Reactive()
  protected get height(): string | undefined {
    let height = StyleHelper.px(this.getDsl().height);
    if (this.inline && !height) {
      height = '400px';
    }
    return height;
  }

  @Widget.Reactive()
  protected get minHeight(): string | undefined {
    return StyleHelper.px(this.getDsl().minHeight);
  }

  @Widget.Reactive()
  protected get maxHeight(): string | undefined {
    return StyleHelper.px(this.getDsl().maxHeight);
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected get sortable() {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.tableConfig.sortable)).orElse(true);
  }

  /**
   * 视图控制组，包含所有子组件
   */
  @Widget.Reactive()
  protected get viewControlWidget(): DslDefinition | undefined {
    if (!this.viewControlChildren.length) {
      return undefined;
    }
    return {
      dslNodeType: DslDefinitionType.ELEMENT,
      widget: 'ViewControl',
      widgets: this.viewControlChildren
    };
  }

  /**
   * 视图控制相关的子组件, 可能包含（排序、分组、行高切换、全屏）
   */
  @Widget.Reactive()
  protected get viewControlChildren(): DslDefinition[] {
    const controls: { enabled: boolean; widget: string; props?: Record<string, unknown> }[] = [
      {
        enabled: this.sortable,
        widget: 'SortControl'
      },
      {
        enabled: this.enableGrouping,
        widget: 'GroupControl'
      },
      {
        enabled: this.enabledFullScreen,
        widget: 'FullScreenControl'
      },
      {
        enabled: this.switchLineHeight,
        widget: 'LineHeightControl'
      },
      {
        enabled: this.enabledKeyboard,
        widget: 'KeyboardShortcut'
      }
    ];
    return controls
      .filter(({ enabled }) => enabled)
      .map(({ widget, props }) => ({
        dslNodeType: DslDefinitionType.ELEMENT,
        ...props,
        widget,
        widgets: []
      }));
  }

  /**
   * 启用切换行高
   * @protected
   */
  @Widget.Reactive()
  protected get switchLineHeight() {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.tableConfig.switchLineHeight)).orElse(true);
  }

  @Widget.Reactive()
  protected get enabledFullScreen(): boolean {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.tableConfig.enabledFullScreen)).orElse(true);
  }

  // region 行内编辑

  /**
   * 启用行内编辑（对所有列均生效）
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get editable(): boolean | undefined {
    if (this.currentEditorContext?.forceEditable) {
      return true;
    }
    if (this.inline) {
      return Optional.ofNullable(BooleanHelper.toBoolean(this.getDsl().editable)).orElse(true);
    }
    return BooleanHelper.toBoolean(this.getDsl().editable);
  }

  /**
   * 过滤列的行内编辑
   * @param context 激活编辑模式上下文
   * @param columnWidget 列组件
   * @param index 索引
   * @protected
   */
  protected filterEditable(context: ActiveEditorContext, columnWidget: BaseTableColumnWidget, index: number): boolean {
    return true;
  }

  /**
   * 行内编辑触发方式
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get editorTrigger(): TableEditorTrigger {
    return (
      ((this.getDsl().editorTrigger as string)?.toLowerCase?.() as TableEditorTrigger) || TableEditorTrigger.dblclick
    );
  }

  /**
   * 行内编辑模式
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get editorMode(): TableEditorMode {
    return (
      this.currentEditorContext?.editorMode ||
      ((this.getDsl().editorMode as string)?.toLowerCase?.() as TableEditorMode) ||
      TableEditorMode.row
    );
  }

  /**
   * 行内编辑关闭触发方式
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get editorCloseTrigger(): TableEditorCloseTrigger {
    return (
      this.currentEditorContext?.editorCloseTrigger ||
      ((this.getDsl().editorCloseTrigger as string)?.toLowerCase?.() as TableEditorCloseTrigger) ||
      TableEditorCloseTrigger.auto
    );
  }

  @Widget.Reactive()
  protected get editorShowIcon(): boolean {
    return Optional.ofNullable(this.getDsl().editorShowIcon).map(BooleanHelper.toBoolean).orElse(true)!;
  }

  @Widget.Reactive()
  protected lastedCurrentEditorContext: ActiveEditorContext | undefined;

  /**
   * 当前编辑模式上下文
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get currentEditorContext(): ActiveEditorContext | undefined {
    return this.lastedCurrentEditorContext;
  }

  protected isNewRow(row?: ActiveRecord): boolean | undefined {
    const { currentEditorContext } = this;
    if (currentEditorContext) {
      if (currentEditorContext.new) {
        return true;
      }
      if (currentEditorContext.rowIndex === -1) {
        return !FetchUtil.generatorPksObject(this.model, row || currentEditorContext.row);
      }
      return false;
    }
    return undefined;
  }

  /**
   * 激活编辑模式前的回调
   * @param context 激活编辑模式上下文
   * @protected
   * @return true 允许打开编辑模式; false 阻止打开编辑模式
   */
  @Widget.Method()
  protected activeEditorBefore(context: ActiveEditorContext): boolean {
    const { field } = context.column;
    let isEnabled = true;
    if (field) {
      const columnWidget = this.getColumnWidgets().find((v) => v.itemData === field);
      if (
        columnWidget &&
        columnWidget.editable &&
        columnWidget.editorTrigger !== TableEditorTrigger.manual &&
        columnWidget.editorMode === TableEditorMode.cell
      ) {
        const { row, rowIndex, origin } = context;
        isEnabled = columnWidget.cellEditable({
          key: VxeTableHelper.getKey(row),
          data: row,
          index: rowIndex,
          origin
        });
      }
    }
    if (!isEnabled) {
      return false;
    }

    const activeEditorRecord = this.tableInstance?.getActiveEditorRecord();

    if (activeEditorRecord) {
      /**
       * 如果存在激活的单元格
       *  1: 配置的是是手动关闭，那么只能点击对应的“按钮”才能关闭
       */
      if (this.editorCloseTrigger === TableEditorCloseTrigger.manual) {
        return false;
      }
    }
    return true;
  }

  /**
   * Vxe-Table 事件不支持异步，使用关闭后置执行队列保证异步执行有序。
   * <br>在使用单元格级别的行内编辑时，切换单元格将快速执行 close -> active 事件
   * <br>async/await 将打乱执行顺序，导致 currentEditorContext 变量异常，上下文出现混乱
   * @protected
   */
  protected activeClosedAfterQueue: Function[] | undefined;

  /**
   * 激活编辑模式回调
   * @param context 激活编辑模式上下文
   * @protected
   */
  @Widget.Method()
  protected activeEditor(context: ActiveEditorContext): ReturnPromise<void> {
    const { editableMap } = context;
    context.row = cloneDeep(context.row);
    this.getColumnWidgets(true).forEach((columnWidget, index) => {
      editableMap[columnWidget.path] = this.filterEditable(context, columnWidget, index);
    });
    if (this.activeClosedAfterQueue) {
      this.activeClosedAfterQueue.push(() => {
        this.updateLastedCurrentEditorContext(context);
      });
    } else {
      this.updateLastedCurrentEditorContext(context);
    }
  }

  protected updateLastedCurrentEditorContext(context: ActiveEditorContext): void {
    const { lastedCurrentEditorContext } = this;
    if (lastedCurrentEditorContext) {
      if (lastedCurrentEditorContext.prepare) {
        this.lastedCurrentEditorContext = {
          ...context,
          ...this.lastedCurrentEditorContext,
          prepare: false
        };
      } else {
        if (this.editorMode !== TableEditorMode.cell) {
          console.error('You must be clear lasted current editor context.');
        }
        this.lastedCurrentEditorContext = context;
      }
    } else {
      this.lastedCurrentEditorContext = context;
    }
  }

  /**
   * 行编辑关闭前
   * @param context 行上下文
   * @protected
   */
  @Widget.Method()
  @Widget.Provide()
  protected async rowEditorClosedBefore(context: RowContext): Promise<boolean> {
    // 新增时有可能会多出来一些空值key。 过滤后对比
    // const pureData = omitBy({ ...context.data }, isNil);
    // if (isEqual(pureData, this.currentEditorContext!.row) && this.tableRowEditMode === TableRowEditMode.CREATE) {
    //   if (context?.data) {
    //     await this.removeRecordFormDataSource(context);
    //   }
    //   return false;
    // }
    const res = await this.rowEditorClosedForValidator(context);
    if (!res) {
      return false;
    }
    return res;
  }

  /**
   * 行编辑关闭
   * @param context 行上下文
   * @protected
   */
  @Widget.Method()
  @Widget.Provide()
  protected rowEditorClosed(context: RowContext | undefined): Promise<boolean> {
    this.activeClosedAfterQueue = [];
    return this.$rowEditorClosed(context)
      .then((res) => {
        this.activeClosedAfterQueue?.forEach((fn) => fn());
        return res;
      })
      .finally(() => {
        this.activeClosedAfterQueue = undefined;
      });
  }

  protected async $rowEditorClosed(context: RowContext | undefined) {
    if (!context || this.currentEditorContext?.prepare) {
      return true;
    }
    if (!this.currentEditorContext?.submit) {
      await this.rowEditorClosedAfterProcess(context);
      this.lastedCurrentEditorContext = undefined;
      return true;
    }
    let res = await this.rowEditorClosedBefore(context);
    if (!res) {
      return false;
    }
    const data = await this.rowEditorClosedForSubmit(context);
    if (this.inline) {
      if (res && data) {
        if (this.isNewRow(data)) {
          const newRow = omitBy({ ...data }, isNil);
          if (Object.keys(newRow).length > 0) {
            context = { ...context, data: newRow };
            this.$rowEditorComputeInvisibleColumns(context);
            this.createSubviewFieldWidget(context, newRow);
          }
        } else {
          context = { ...context, data };
          this.$rowEditorComputeInvisibleColumns(context);
          this.updateSubviewFieldWidget(context, data);
        }
      }
    } else if (data) {
      try {
        if (this.isNewRow(data)) {
          const newRow = omitBy({ ...data }, isNil);
          if (Object.keys(newRow).length > 0) {
            context = { ...context, data: newRow };
            this.$rowEditorComputeInvisibleColumns(context);
            res = await this.rowEditorClosedForCreate(context, newRow);
          }
        } else {
          context = { ...context, data };
          this.$rowEditorComputeInvisibleColumns(context);
          res = await this.rowEditorClosedForUpdate(context, data);
        }
      } catch (e) {
        res = false;
      }
    }
    if (res) {
      await this.rowEditorClosedAfterProcess(context);
      if (this.editorMode !== TableEditorMode.cell) {
        this.lastedCurrentEditorContext = undefined;
      }
    }
    return res;
  }

  protected $rowEditorComputeInvisibleColumns(context: RowContext) {
    (this.viewState as OioTableViewState)?.fields
      ?.map((v) => Widget.select<BaseTableColumnWidget>(v))
      .filter((v) => v != null && v.invisible)
      .forEach((v) => v?.compute(context));
  }

  /**
   * 行内编辑关闭时的数据验证
   * @param context 行上下文
   * @protected
   */
  protected async rowEditorClosedForValidator(context?: RowContext): Promise<boolean> {
    // fixme @zbh 20230203 根据参数判断是否需要校验
    let res: boolean | undefined = await this.validatorCallChaining?.call();
    if (res == null) {
      res = true;
    }
    return res;
  }

  @Widget.Reactive()
  protected get rowEditorSubmitAll() {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.tableConfig.rowEditorSubmitAll)).orElse(false);
  }

  /**
   * 行内编辑关闭时的数据提交
   * @param context 行上下文
   * @protected
   */
  protected async rowEditorClosedForSubmit(context: RowContext): Promise<ActiveRecord | undefined> {
    const { rowEditorSubmitAll, editorMode, editorCloseTrigger } = this;
    if (rowEditorSubmitAll) {
      if (editorMode === TableEditorMode.row || editorMode === TableEditorMode.cell) {
        return context.data;
      }
      console.error('Invalid editor mode.', editorMode);
      return undefined;
    }
    switch (editorMode) {
      case TableEditorMode.row: {
        switch (editorCloseTrigger) {
          case TableEditorCloseTrigger.manual:
            return this.$rowEditorClosedForSubmit(context);
          case TableEditorCloseTrigger.auto:
            return context.data;
          default:
            console.error('Invalid editor close trigger.', editorCloseTrigger);
        }
        return undefined;
      }
      case TableEditorMode.cell: {
        return this.$rowEditorClosedForSubmit(context);
      }
      default:
        console.error('Invalid editor mode.', editorMode);
    }
    return undefined;
  }

  public updateSubviewFieldWidget(context: RowContext, data: ActiveRecords) {
    Optional.ofNullable(this.metadataRuntimeContext.field)
      .filter<RuntimeO2MField | RuntimeM2MField>((v) => isRelation2MField(v!))
      .ifPresent((field) => {
        Optional.ofNullable(this.metadataRuntimeContext.handle)
          .map(Widget.select)
          .map((v) => v!.getParent() as unknown as IFormSubviewListFieldWidget)
          .ifPresent((subviewFieldWidget) => {
            const showRecords = subviewFieldWidget.dataSource;
            const { submitCache } = field;
            const subviewSubmitCache = this.metadataRuntimeContext.extendData.subviewSubmitCache as SubmitCacheManager;
            if (showRecords) {
              if (submitCache) {
                ActiveRecordsOperator.operator(showRecords, submitCache).updateByEntity(context.data || data);
              }
              if (subviewSubmitCache) {
                ActiveRecordsOperator.operator(showRecords, subviewSubmitCache).updateByEntity(context.data || data);
              }
            }
            subviewFieldWidget.flushDataSource();
          });
      });
  }

  public createSubviewFieldWidget(context: RowContext, data: ActiveRecords) {
    Optional.ofNullable(this.metadataRuntimeContext.field)
      .filter<RuntimeO2MField | RuntimeM2MField>((v) => isRelation2MField(v!))
      .ifPresent((field) => {
        Optional.ofNullable(this.metadataRuntimeContext.handle)
          .map(Widget.select)
          .map((v) => v!.getParent() as unknown as IFormSubviewListFieldWidget)
          .ifPresent((subviewFieldWidget) => {
            const showRecords = subviewFieldWidget.dataSource;
            const { submitCache } = field;
            const subviewSubmitCache = this.metadataRuntimeContext.extendData.subviewSubmitCache as SubmitCacheManager;
            if (showRecords) {
              const insertTo = this.lastedCurrentEditorContext?.insertTo;
              if (submitCache) {
                ActiveRecordsOperator.operator(showRecords, submitCache).push(
                  context.data || data,
                  undefined,
                  insertTo
                );
              }
              if (subviewSubmitCache) {
                ActiveRecordsOperator.operator(showRecords, subviewSubmitCache).push(
                  context.data || data,
                  undefined,
                  insertTo
                );
              }
            }
            subviewFieldWidget.flushDataSource();
          });
      });
  }

  /**
   * 内置行内编辑数据提交
   * @param context
   * @protected
   */
  protected async $rowEditorClosedForSubmit(context: RowContext): Promise<ActiveRecord> {
    let data: ActiveRecord | undefined = {};
    // 如果是单元格编辑，只提交当前字段
    if (this.editorMode === TableEditorMode.cell) {
      const { field } = (context.origin as ActiveEditorContext).column;
      field && (data[field] = context.data[field]);
    } else {
      data = (await this.submitCallChaining?.syncCall())?.records as ActiveRecord | undefined;
    }
    if (data == null || isEmpty(data)) {
      console.warn('Invalid update data.');
      return context.data;
    }
    return data;
  }

  @Widget.Reactive()
  protected get rowEditorCreateFun(): string | undefined {
    return this.getDsl().rowEditorCreateFun;
  }

  @Widget.Reactive()
  protected get rowEditorUpdateFun(): string | undefined {
    return this.getDsl().rowEditorUpdateFun;
  }

  /**
   * 行内编辑关闭时的更新服务调用
   * @param context 行上下文
   * @param data 提交数据({@link BaseTableWidget#rowEditorClosedForSubmit}的返回结果)
   * @protected
   */
  protected async rowEditorClosedForUpdate(context: RowContext, data: ActiveRecords): Promise<boolean> {
    const { currentEditorContext } = this;
    if (!currentEditorContext) {
      return true;
    }
    if (Array.isArray(data)) {
      console.error('Invalid data format.', data);
      return true;
    }
    const { model } = this;
    const pksObject = FetchUtil.generatorPksObject(model, currentEditorContext.row);
    if (!pksObject) {
      OioNotification.error(translateValueByKey('错误'), translateValueByKey('行内编辑无法保存未定义主键的模型数据'));
      return false;
    }
    return this.$rowEditorClosedForUpdate(context, {
      ...data,
      ...pksObject
    });
  }

  protected async $rowEditorClosedForUpdate(context: RowContext, data: ActiveRecord): Promise<boolean> {
    const { model, rowEditorUpdateFun } = this;
    let functionDefinition: RuntimeFunctionDefinition | undefined = FunctionMetadata.updateFunction;
    if (rowEditorUpdateFun) {
      functionDefinition = await FunctionCache.get(model.model, rowEditorUpdateFun);
    }
    if (!functionDefinition) {
      MessageHub.error(`${translateValueByKey('找不到指定更新函数')}: ${rowEditorUpdateFun}`);
      console.error('Invalid function definition.', model.model, rowEditorUpdateFun);
      return false;
    }
    const res = await this.executeRowEditorUpdate(functionDefinition, data);
    this.refreshRowEditorUpdate(context, data, res);
    if (this.editorMode !== TableEditorMode.cell) {
      // 单元格编辑时，切换单元格就会触发更新操作，消息提示过于密集
      MessageHub.success(translateValueByKey('更新成功'));
    }
    return true;
  }

  protected async rowEditorClosedForCreate(context: RowContext, data: ActiveRecords): Promise<boolean> {
    const { currentEditorContext } = this;
    if (!currentEditorContext) {
      return true;
    }
    if (Array.isArray(data)) {
      console.error('Invalid data format.', data);
      return true;
    }
    const { model } = this;
    if (model.pks) {
      model.pks.forEach((k) => Reflect.deleteProperty(data, k));
    }
    return this.$rowEditorClosedForCreate(context, data);
  }

  protected async $rowEditorClosedForCreate(context: RowContext, data: ActiveRecord): Promise<boolean> {
    const { model, rowEditorCreateFun } = this;
    let functionDefinition: RuntimeFunctionDefinition | undefined = FunctionMetadata.createFunction;
    if (rowEditorCreateFun) {
      functionDefinition = await FunctionCache.get(model.model, rowEditorCreateFun);
    }
    if (!functionDefinition) {
      MessageHub.error(`${translateValueByKey('找不到指定创建函数')}: ${rowEditorCreateFun}`);
      console.error('Invalid function definition.', model.model, rowEditorCreateFun);
      return false;
    }
    const res = await this.executeRowEditorUpdate(functionDefinition, data);
    this.refreshRowEditorUpdate(context, data, res);
    MessageHub.success(translateValueByKey('创建成功'));
    return true;
  }

  protected async executeRowEditorUpdate(functionDefinition: RuntimeFunctionDefinition, data: ActiveRecord) {
    const { rootRuntimeContext, model } = this;
    const requestFields = rootRuntimeContext.getRequestModelFields();
    const sessionPath = (this.currentEditorContext?.triggerAction as unknown as RuntimeAction)?.sessionPath;
    try {
      if (sessionPath) {
        return await FunctionService.INSTANCE.simpleExecute<Record<string, unknown>>(
          model,
          functionDefinition,
          {
            requestFields,
            variables: {
              path: sessionPath
            }
          },
          data
        );
      }
      return await FunctionService.INSTANCE.simpleExecute<Record<string, unknown>>(
        model,
        functionDefinition,
        {
          requestFields
        },
        data
      );
    } catch (e) {
      formValidateErrorProcess(e as HttpClientError);
      throw e;
    }
  }

  protected refreshRowEditorUpdate(context: RowContext, data: ActiveRecord, res: unknown) {
    const { currentEditorContext, dataSource } = this;
    if (currentEditorContext && dataSource) {
      if (res && isPlainObject(res) && !isEqual(res, data)) {
        const currentRow = context.data;
        if (currentRow) {
          Object.entries(res as Record<string, unknown>).forEach(([key, value]) => {
            currentRow[key] = value;
          });
          this.updateActiveRecordByData(currentRow);
        }
      }
    }
  }

  /**
   * 行内编辑关闭时的后置处理
   * @param context 行上下文
   * @protected
   */
  protected async rowEditorClosedAfterProcess(context: RowContext): Promise<void> {
    const { dataSource, currentEditorContext } = this;
    if (currentEditorContext && !currentEditorContext.submit) {
      const $data = currentEditorContext.row;
      if (dataSource) {
        if (this.isNewRow()) {
          this.tableInstance?.removeInsertRow();
          return;
        }
        dataSource[currentEditorContext.rowIndex] = $data;
        this.reloadDataSource([...dataSource]);
      }
      this.updateActiveRecordByData($data);
    }
  }

  protected updateActiveRecordByData(data: ActiveRecord) {
    const { activeRecords } = this;
    if (activeRecords) {
      const id = VxeTableHelper.getKey(data);
      const activeRecordIndex = activeRecords.findIndex((v) => VxeTableHelper.getKey(v) === id);
      if (activeRecordIndex !== -1) {
        activeRecords[activeRecordIndex] = data;
        this.reloadActiveRecords([...activeRecords]);
      }
    }
  }

  // endregion

  // region keyboard-config

  /**
   * 允许键盘快捷操作
   * @protected
   */
  @Widget.Reactive()
  protected get enabledKeyboard(): boolean {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.tableConfig.enabledKeyboard)).orElse(!!this.editable);
  }

  /**
   * 表格单元格快捷键编辑
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get keyboardConfig(): TableKeyboardConfig {
    return this.defaultKeyboardConfig;
  }

  protected get defaultKeyboardConfig(): TableKeyboardConfig {
    let { keyboardConfig } = this.tableConfig;
    if (!keyboardConfig) {
      keyboardConfig = {};
    }
    keyboardConfig.left = keyboardConfig.left || { key: 'Tab', shift: true, desc: '向左移动单元格' };
    keyboardConfig.right = keyboardConfig.right || { key: 'Tab', desc: '向右移动单元格' };
    keyboardConfig.up = keyboardConfig.up || { key: 'Enter', ctrl: true, shift: true, desc: '向上移动单元格' };
    keyboardConfig.down = keyboardConfig.down || { key: 'Enter', ctrl: true, desc: '向下移动单元格' };
    keyboardConfig.enter = keyboardConfig.enter || { key: 'Enter', desc: '提交数据' };
    keyboardConfig.cancel = keyboardConfig.cancel || { key: 'Esc', desc: '取消编辑' };
    return keyboardConfig;
  }

  @Widget.Reactive()
  protected get bindingKeyboardConfig(): Record<string, TableBindingKeyboardConfig[]> {
    const configs: Record<string, TableBindingKeyboardConfig[]> = {};
    const pushConfig = (config: KeyboardConfig | undefined, fn: TableBindingKeyboardConfig['fn']) => {
      if (!config) {
        return;
      }
      const { key, ctrl, shift, alt } = config;
      let bindingConfigs = configs[key];
      if (!bindingConfigs) {
        bindingConfigs = [];
        configs[key] = bindingConfigs;
      }
      bindingConfigs.push({
        key,
        ctrl: ctrl || false,
        shift: shift || false,
        alt: alt || false,
        fn
      });
    };
    const { keyboardConfig } = this;
    pushConfig(keyboardConfig.left, this.onKeyboardMoveToLeftCell);
    pushConfig(keyboardConfig.right, this.onKeyboardMoveToRightCell);
    pushConfig(keyboardConfig.up, this.onKeyboardMoveToUpCell);
    pushConfig(keyboardConfig.down, this.onKeyboardMoveToDownCell);
    pushConfig(keyboardConfig.enter, this.onKeyboardEnter);
    pushConfig(keyboardConfig.cancel, this.onKeyboardCancel);
    return configs;
  }

  protected matchKeyboardFunction(event: KeyboardEvent): ((e: KeyboardEvent) => void) | undefined {
    const { bindingKeyboardConfig } = this;
    const eventKey = event.key;
    let bindingConfigs = bindingKeyboardConfig[eventKey];
    if (bindingConfigs == null && eventKey === 'Escape') {
      bindingConfigs = bindingKeyboardConfig.Esc;
    }
    if (!bindingConfigs) {
      return undefined;
    }
    const { ctrlKey, metaKey, shiftKey, altKey } = event;
    for (const bindingConfig of bindingConfigs) {
      const { ctrl, shift, alt } = bindingConfig;
      const isCtrlMatch = ctrlKey === ctrl || metaKey === ctrl;
      const isShiftMatch = shiftKey === shift;
      const isAltMatch = altKey === alt;
      if (isCtrlMatch && isShiftMatch && isAltMatch) {
        return bindingConfig.fn;
      }
    }
    return undefined;
  }

  protected onKeyboardMoveToRightCell(event: KeyboardEvent) {}

  protected onKeyboardMoveToLeftCell(event: KeyboardEvent) {}

  protected onKeyboardMoveToDownCell(event: KeyboardEvent) {}

  protected onKeyboardMoveToUpCell(event: KeyboardEvent) {}

  protected onKeyboardEnter(event: KeyboardEvent) {}

  protected onKeyboardCancel(event: KeyboardEvent) {}

  // endregion

  // region sort-config

  @Widget.Reactive()
  protected internalSortConfig: VxeTablePropTypes.SortConfig = {};

  @Widget.Reactive()
  protected multipleFieldSort = false;

  @Widget.Reactive()
  protected get sortConfig(): VxeTablePropTypes.SortConfig {
    const sortConfig = {
      ...this.internalSortConfig,
      ...(this.getDsl().sortConfig || {})
    };
    if (sortConfig.multiple == null) {
      sortConfig.multiple = this.multipleFieldSort;
    }
    return sortConfig;
  }

  protected initSortConfig() {
    this.multipleFieldSort = (this.sortList?.length || 0) >= 2;
    const sortConfig = this.internalSortConfig;
    if (sortConfig.remote == null) {
      sortConfig.remote = true;
    }
    if (sortConfig.defaultSort == null) {
      const defaultSort: { field: string; order: VxeTablePropTypes.SortOrder }[] = [];
      for (const { sortField, direction } of this.sortList || []) {
        defaultSort.push({
          field: sortField,
          order: direction.toLowerCase() as VxeTablePropTypes.SortOrder
        });
      }
      sortConfig.defaultSort = defaultSort;
    }
  }

  // endregion

  // region 数据分组

  /**
   * 启用分组
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get enableGrouping(): boolean {
    if (this.inline && !this.isDataSourceProvider) {
      // fixme @zbh 20250925 子表格暂不支持分组
      return false;
    }
    return Optional.ofNullable(BooleanHelper.toBoolean(this.tableConfig.enableGrouping)).orElse(true);
  }

  /**
   * 分组视图数据源的总数量
   */
  @Widget.Reactive()
  protected groupingExpandedAll: boolean | undefined;

  /**
   * 当前视图使用分组结构展示
   *  启动了分组并且有分组字段
   */
  @Widget.Provide()
  @Widget.Reactive()
  protected get enabledGroupView(): boolean {
    return this.enableGrouping && !!this.groupList?.length;
  }

  /**
   * 分组视图底部展示「展开全部」操作
   */
  @Widget.Reactive()
  protected get groupViewFooterExpandControl() {
    if (this.enabledGroupView) {
      return !!this.groupingExpandedAll;
    }
    return false;
  }

  /**
   * 分组视图底部展示「收起全部」操作
   */
  @Widget.Reactive()
  protected get groupViewFooterFoldControl() {
    return true;
  }

  /**
   * 分组参数
   * @protected
   */
  @Widget.Provide()
  @Widget.Reactive()
  protected groupList: GroupingField[] | undefined = undefined;

  /**
   * 默认分组字段
   * @protected
   * @example "field00003,field00004"
   * @returns [field00003 desc,field00004 desc]
   */
  @Widget.Reactive()
  protected get grouping(): GroupingField[] | undefined {
    const dsf: string = this.getDsl().grouping;
    if (dsf) {
      const dsfArr = dsf.split(ORDERING_SEPARATOR).filter((v) => !isEmpty(v));
      return dsfArr.map((v: string) => {
        const [field, direction] = getSortFieldDirection(v);
        return { field, direction };
      });
    }
    return undefined;
  }

  /**
   * 修改分组配置
   */
  @Widget.Provide()
  @Widget.Method()
  public onGroupChange(groupList: GroupingField[]): void {
    const finalGroupList = groupList.length ? groupList : [];
    const groupParameters: UrlQueryParameters = {};
    if (finalGroupList?.length) {
      groupParameters.groupField = finalGroupList.map((v) => v.field).join(URL_SPLIT_SEPARATOR);
      groupParameters.groupDirection = finalGroupList.map((v) => v.direction).join(URL_SPLIT_SEPARATOR);
    } else {
      groupParameters.groupField = null;
      groupParameters.groupDirection = null;
    }
    let { pagination } = this;
    if (pagination) {
      pagination.current = 1;
    } else {
      pagination = this.generatorPagination();
    }
    groupParameters.currentPage = toString(pagination.current);
    groupParameters.pageSize = toString(pagination.pageSize);

    this.groupList = finalGroupList;

    if (this.inline) {
      this.refreshProcess();
      return;
    }

    this.$router.push({
      segments: [
        {
          path: 'page',
          parameters: groupParameters,
          extra: {
            preserveParameter: true
          }
        }
      ]
    });
    this.refreshProcess();
  }

  /**
   * 初始化分组字段列表，优选取url上面的配置，如果没有就取设计器配置
   */
  protected initGroupList() {
    const { groupField, groupDirection } = this.urlParameters;
    let { groupList } = this;

    if (!groupList && groupField && groupDirection) {
      groupList = [];
      const groupFields = StringHelper.convertArray(groupField);
      const directions = StringHelper.convertArray(groupDirection);
      if (groupFields.length && directions.length && groupFields.length === directions.length) {
        for (let i = 0; i < groupFields.length; i++) {
          groupList.push({ field: groupFields[i], direction: directions[i] as EDirection });
        }
      }
      this.groupList = groupList;
    } else if (!groupList && this.grouping?.length) {
      this.groupList = this.grouping;
    }
  }

  // endregion

  // region 表格事件

  @Widget.Reactive()
  @Widget.Inject()
  protected tableEventCallChaining: TableEventCallChaining | undefined;

  protected async onAddRowEvent(e?: Omit<TableAddEvent, 'type'>) {
    if (this.lastedCurrentEditorContext == null) {
      this.lastedCurrentEditorContext = {
        prepare: true,
        new: true,
        insertTo: e?.insertTo,
        editorMode: TableEditorMode.row,
        editorCloseTrigger: TableEditorCloseTrigger.auto,
        forceEditable: true
      } as ActiveEditorContext;
    }
    let target: ActiveRecord[] | undefined;
    if (e?.activeRecords) {
      target = e.activeRecords;
    } else if (e?.activeRecord) {
      target = [e.activeRecord];
    } else {
      target = [{}];
    }
    const records = ActiveRecordsOperator.repairRecords(target);
    const { row: newRow } = await this.tableInstance?.insert(records, e?.insertTo);
    nextTick(() => {
      this.tableInstance?.setEditRow(newRow);
    });
  }

  protected async onCopyRowEvent(e: Omit<TableCopyEvent, 'type'>) {
    if (this.lastedCurrentEditorContext == null) {
      this.lastedCurrentEditorContext = {
        prepare: true,
        editorMode: TableEditorMode.row,
        editorCloseTrigger: TableEditorCloseTrigger.auto,
        forceEditable: true
      } as ActiveEditorContext;
    }
    let target: ActiveRecord[] | undefined;
    if (e.activeRecords) {
      target = e.activeRecords;
    } else if (e.activeRecord) {
      target = [e.activeRecord];
    } else if (e.index != null) {
      const t = this.dataSource?.[e.index];
      if (t) {
        target = [t];
      }
    }
    if (!target?.length) {
      console.error('Invalid copy records.', e);
      return;
    }
    if (e.clone) {
      target = activeRecordsClone(target);
    }
    const records = ActiveRecordsOperator.repairRecords(target);
    const { row: newRow } = await this.tableInstance?.insert(records, e.copyTo);
    nextTick(() => {
      if (Array.isArray(newRow)) {
        this.tableInstance?.setEditRow(newRow[0]);
      } else {
        this.tableInstance?.setEditRow(newRow);
      }
    });
  }

  protected onEditRowEvent(e: Omit<TableEditEvent, 'type'>) {
    console.warn('Unsupported operation', e);
  }

  // endregion

  public executeExpression<T>(
    activeRecord: ActiveRecords | undefined,
    expression: string,
    errorValue?: T
  ): T | string | undefined {
    let activeRecords: ActiveRecord[];
    if (activeRecord == null) {
      activeRecords = [{}];
    } else if (Array.isArray(activeRecord)) {
      activeRecords = activeRecord;
    } else {
      activeRecords = [activeRecord];
    }
    return Expression.run(
      {
        activeRecords,
        rootRecord: this.rootData?.[0] || {},
        openerRecord: this.openerActiveRecords?.[0] || {},
        scene: this.scene
      } as ExpressionRunParam,
      expression,
      errorValue
    );
  }

  // region 列组件收集

  /**
   * @deprecated
   */
  protected columnWidgetMap: Map<string, ColumnWidgetEntity> = new Map();

  /**
   * @deprecated
   */
  @Widget.Method()
  @Widget.Provide()
  protected fieldWidgetMounted(widget: BaseTableColumnWidget) {
    this.columnWidgetMap.set(widget.path, {
      widget,
      index: this.columnWidgetMap.size
    });
  }

  /**
   * @deprecated
   */
  @Widget.Method()
  @Widget.Provide()
  protected fieldWidgetUnmounted(widget: BaseTableColumnWidget) {
    this.columnWidgetMap.delete(widget.path);
  }

  /**
   * @deprecated
   */
  public getColumnWidgets(sort = false): BaseTableColumnWidget[] {
    const iterator = this.columnWidgetMap.values();
    let next = iterator.next();
    if (sort) {
      const columnWidgets: ColumnWidgetEntity[] = [];
      while (!next.done) {
        columnWidgets.push(next.value);
        next = iterator.next();
      }
      return columnWidgets.sort((a, b) => a.index - b.index).map((v) => v.widget);
    }
    const fieldWidgets: BaseTableColumnWidget[] = [];
    while (!next.done) {
      fieldWidgets.push(next.value.widget);
      next = iterator.next();
    }
    return fieldWidgets;
  }

  // endregion

  @Widget.Method()
  public onCheckedChange(data: ActiveRecords, event?: CheckedChangeEvent) {
    const records =
      this.enabledGroupView && Array.isArray(data)
        ? data.filter((record) => !record[GROUP_TREE_KEY.CHILDREN_KEY])
        : data;
    super.onCheckedChange(records, event);
  }

  @Widget.Method()
  public onCheckedAllChange(selected: boolean, data: ActiveRecord[], event?: CheckedChangeEvent) {
    if (selected) {
      const records =
        this.enabledGroupView && Array.isArray(data)
          ? data.filter((record) => !record[GROUP_TREE_KEY.CHILDREN_KEY])
          : data;
      super.onCheckedAllChange(selected, records, event);
    } else {
      super.onCheckedAllChange(selected, data, event);
    }
  }

  @Widget.Method()
  @Widget.Provide()
  public onSortChange(sortList: ISort[]) {
    super.onSortChange(sortList);
    this.multipleFieldSort = (this.sortList?.length || 0) >= 2;
    nextTick(() => {
      if (this.sortList?.length) {
        (this.tableInstance?.getSortColumns() || [])
          .filter((v) => !this.sortList?.find((vv) => vv.sortField === v.field))
          .forEach((v) => this.tableInstance?.clearSort(v.field));
        this.tableInstance?.sort(
          this.sortList.map((sort) => ({
            field: sort.sortField,
            order: sort.direction.toLowerCase() as 'asc' | 'desc'
          }))
        );
      } else {
        this.tableInstance?.sort([]);
      }
    });
  }

  protected $$initViewState(state: OioAnyViewState): void {
    if (isTableViewState(state) && !state.table) {
      state.table = this.currentHandle;
    }
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    this.initGroupList();
    this.initSortConfig();
  }

  protected $$mounted() {
    super.$$mounted();
    this.submitCallChaining?.callBefore(
      () => {
        if (this.currentEditorContext) {
          return new SubmitValue({});
        }
        return new SubmitValue(this.activeRecords);
      },
      { force: true, immutable: false }
    );
    this.tableEventCallChaining?.hook(this.path, (args) => {
      const e = args?.[0] as BaseTableEvent;
      if (!e) {
        return;
      }
      switch (e.type) {
        case TableEventType.add:
          this.onAddRowEvent(e);
          break;
        case TableEventType.copy:
          this.onCopyRowEvent(e);
          break;
        case TableEventType.edit:
          this.onEditRowEvent(e);
          break;
        default:
          console.error(`Invalid event type: ${e.type}`, e);
          break;
      }
    });
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.tableEventCallChaining?.unhook(this.path);
  }
}
