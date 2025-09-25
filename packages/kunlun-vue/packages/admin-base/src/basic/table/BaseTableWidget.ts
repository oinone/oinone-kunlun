import { DEFAULT_SLOT_NAME, DslDefinition, DslDefinitionType } from '@oinone/kunlun-dsl';
import {
  ActiveRecord,
  ActiveRecords,
  ActiveRecordsOperator,
  FunctionCache,
  FunctionMetadata,
  FunctionService,
  isRelation2MField,
  parseConfigs,
  RelationUpdateType,
  RuntimeAction,
  RuntimeFunctionDefinition,
  RuntimeM2MField,
  RuntimeO2MField,
  SubmitCacheManager,
  SubmitValue,
  TableConfigManager,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { Expression, ExpressionRunParam } from '@oinone/kunlun-expression';
import { MessageHub } from '@oinone/kunlun-request';
import { EDirection, IGroup, ISort } from '@oinone/kunlun-service';
import { BooleanHelper, CallChaining, Optional, ReturnPromise } from '@oinone/kunlun-shared';
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
import { Widget } from '@oinone/kunlun-vue-widget';
import { cloneDeep, isEmpty, isEqual, isNil, isPlainObject, omitBy, toString } from 'lodash-es';
import { nextTick } from 'vue';
import { VxeTablePropTypes } from 'vxe-table';
import { ActionKeyboardConfig, TableLineHeightEnum, TableRowEditMode } from '../../typing';
import { FetchUtil } from '../../util';
import { BaseElementListViewWidget, BaseElementListViewWidgetProps, getSortFieldDirection } from '../element';
import { BaseTableColumnWidget } from '../table-column';
import { FieldWidgetComponentFunction, IFormSubviewListFieldWidget, UrlQueryParameters } from '../types';

interface ColumnWidgetEntity {
  widget: BaseTableColumnWidget;
  index: number;
}

function isActiveRecordArray(value: ActiveRecords): value is ActiveRecord[] {
  return Array.isArray(value);
}

interface TableKeyboardConfig {
  down: ActionKeyboardConfig[]; // 向下移动单元格
  up: ActionKeyboardConfig[]; // 向上移动单元格
  left: ActionKeyboardConfig[]; // 向左移动单元格
  right: ActionKeyboardConfig[]; // 向右移动单元格
  cancel: ActionKeyboardConfig[]; // 取消操作
  submit: ActionKeyboardConfig[]; // 提交数据
}

const URL_SPLIT_SEPARATOR = ',';
const ORDERING_SEPARATOR = ',';
const ORDERING_FIELD_ORDER_SEPARATOR = ' ';
const DEFAULT_ORDERING_ORDER = EDirection.ASC;

export class BaseTableWidget<
  Props extends BaseElementListViewWidgetProps = BaseElementListViewWidgetProps
> extends BaseElementListViewWidget<Props> {
  protected tableInstance: OioTableInstance | undefined;

  protected tableRowEditMode: TableRowEditMode | undefined;

  @Widget.Reactive()
  @Widget.Provide('tableForceEditable')
  protected createMode: boolean | undefined;

  protected cachedEditActiveRecords: ActiveRecord | undefined;

  protected currentTriggerCreateAction: RuntimeAction | undefined;

  public getTableInstance() {
    return this.tableInstance;
  }

  protected get tableConfig() {
    return TableConfigManager.getConfig();
  }

  /**
   * 表格单元格快捷键编辑
   */
  protected keyboardShortcut: TableKeyboardConfig = {
    down: [{ key: 'Enter', ctrl: true }], // 向下移动单元格
    up: [{ key: 'Enter', ctrl: true, shift: true }], // 向上移动单元格
    left: [{ key: 'Tab', shift: true }], // 向左移动单元格
    right: [{ key: 'Tab' }], // 向右移动单元格
    cancel: [{ key: 'Esc' }], // 取消操作
    submit: [{ key: 'Enter' }] // 提交数据
  };

  @Widget.Method()
  protected setTableInstance(tableInstance: OioTableInstance | undefined) {
    this.tableInstance = tableInstance;
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
      height = '300px';
    }
    return height;
  }

  @Widget.Provide()
  @Widget.Reactive()
  protected lineHeightType = TableLineHeightEnum.DEFAULT;

  @Widget.Provide()
  protected setLineHeightType(value: TableLineHeightEnum) {
    this.lineHeightType = value;
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
    return super.sortable;
  }

  protected get defaultSortable() {
    const { sortable } = this.tableConfig;
    if (sortable == null) {
      return true;
    }
    return sortable;
  }

  // region 行内编辑

  /**
   * 启用行内编辑（对所有列均生效）
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get editable(): boolean | undefined {
    return this.createMode || BooleanHelper.toBoolean(this.getDsl().editable);
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
   * 启用分组
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get groupable() {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.getDsl().groupable)).orElse(this.defaultEnableGrouping);
  }

  protected get defaultEnableGrouping() {
    const { enableGrouping } = this.tableConfig;
    if (enableGrouping == null) {
      return true;
    }
    return enableGrouping;
  }

  /**
   * 启用行高
   * @protected
   */
  @Widget.Reactive()
  protected get lineHeightAble() {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.getDsl().lineHeightAble)).orElse(
      this.defaultSwitchLineHeight
    );
  }

  protected get defaultSwitchLineHeight() {
    const { switchLineHeight } = this.tableConfig;
    if (switchLineHeight == null) {
      return true;
    }
    return switchLineHeight;
  }

  /**
   * 允许键盘快捷操作
   * @protected
   */
  @Widget.Reactive()
  protected get keyBoardAble(): boolean {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.getDsl().keyBoardAble)).orElse(this.defaultEnabledKeyboard);
  }

  protected get defaultEnabledKeyboard() {
    const { enabledKeyboard } = this.tableConfig;
    if (enabledKeyboard == null) {
      return true;
    }
    return enabledKeyboard;
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
        enabled: this.groupable,
        widget: 'GroupControl'
      },
      {
        enabled: this.lineHeightAble,
        widget: 'LineHeightControl'
      },
      {
        enabled: this.fullScreenAble,
        widget: 'FullScreenControl'
      },
      {
        enabled: this.keyBoardAble,
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

  protected get defaultEnabledFullScreen() {
    const { enabledFullScreen } = this.tableConfig;
    if (enabledFullScreen == null) {
      return true;
    }
    return enabledFullScreen;
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
    return this.createMode
      ? TableEditorMode.row
      : ((this.getDsl().editorMode as string)?.toLowerCase?.() as TableEditorMode) || TableEditorMode.cell;
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected editRowCallChaining: CallChaining | undefined;

  protected async editRow(type: unknown, data: unknown) {
    this.createMode = type !== TableRowEditMode.EXIST;
    this.tableRowEditMode = type as TableRowEditMode;
    const { record, action } = data as { record: ActiveRecord | undefined; action: RuntimeAction };
    nextTick(() => {
      this.tableInstance?.setEditRow(record);
      this.cachedEditActiveRecords = cloneDeep(record);
      this.currentTriggerCreateAction = action;
    });
  }

  /**
   * 行内触发关闭触发方式
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get editorCloseTrigger(): TableEditorCloseTrigger {
    return (
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
    this.lastedCurrentEditorContext = context;
  }

  protected async removeRecordFormDataSource(context: RowContext) {
    const { data } = context;
    const newActiveRecords = this.dataSource?.filter((v) => v.__draftId !== data.__draftId);
    return this.reloadDataSource(newActiveRecords);
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
    const pureData = omitBy({ ...context.data }, isNil);
    if (isEqual(pureData, this.cachedEditActiveRecords) && this.tableRowEditMode === TableRowEditMode.CREATE) {
      if (context?.data) {
        await this.removeRecordFormDataSource(context);
      }
      this.createMode = false;
      this.cachedEditActiveRecords = undefined;
      this.currentTriggerCreateAction = undefined;
      return false;
    }
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
  protected async rowEditorClosed(context: RowContext | undefined): Promise<boolean> {
    if (!context) {
      return true;
    }

    let res = await this.rowEditorClosedBefore(context);
    if (!res) {
      return false;
    }
    const data = await this.rowEditorClosedForSubmit(context);
    const useDiffUpdate = [RelationUpdateType.diff, RelationUpdateType.batch].includes(this.relationUpdateType);
    if (this.inline) {
      if (res && data) {
        if (this.createMode && useDiffUpdate) {
          this.createSubviewFieldWidget(context, data);
        } else {
          this.updateSubviewFieldWidget(context, data);
        }
      }
    } else if (data) {
      try {
        if (this.createMode) {
          res = await this.rowEditorClosedForCreate(context, data);
        } else {
          res = await this.rowEditorClosedForUpdate(context, data);
        }
      } catch (e) {
        console.error(e);
        res = false;
      }
    }
    if (res) {
      await this.rowEditorClosedAfterProcess(context);

      if (this.editorMode !== TableEditorMode.cell) {
        this.lastedCurrentEditorContext = undefined;
      }
    }
    if (!res && context?.data) {
      await this.removeRecordFormDataSource(context);
    }
    this.createMode = false;
    this.cachedEditActiveRecords = undefined;
    this.currentTriggerCreateAction = undefined;
    return res;
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

  /**
   * 行内编辑关闭时的数据提交
   * @param context 行上下文
   * @protected
   */
  protected async rowEditorClosedForSubmit(context: RowContext): Promise<ActiveRecord | undefined> {
    const { editorMode, editorCloseTrigger } = this;
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

  public updateSubviewFieldWidget(context: RowContext, data: ActiveRecord) {
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
                ActiveRecordsOperator.operator(showRecords, submitCache).updateByEntity(context.data);
              }
              if (subviewSubmitCache) {
                ActiveRecordsOperator.operator(showRecords, subviewSubmitCache).updateByEntity(context.data);
              }
            }

            subviewFieldWidget.flushDataSource(false);
          });
      });
  }

  public createSubviewFieldWidget(context: RowContext, data: ActiveRecord) {
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
                ActiveRecordsOperator.operator(showRecords, submitCache).push(context.data);
              }
              if (subviewSubmitCache) {
                ActiveRecordsOperator.operator(showRecords, subviewSubmitCache).push(context.data);
              }
            }

            subviewFieldWidget.flushDataSource(false);
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
    if (isActiveRecordArray(data)) {
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
    await this.refreshRowEditorUpdate(context, data, res);
    return true;
  }

  protected async rowEditorClosedForCreate(context: RowContext, data: ActiveRecords): Promise<boolean> {
    const { currentEditorContext } = this;
    if (!currentEditorContext) {
      return true;
    }
    if (isActiveRecordArray(data)) {
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
    await this.refreshRowEditorUpdate(context, data, res);
    return true;
  }

  protected async executeRowEditorUpdate(functionDefinition: RuntimeFunctionDefinition, data: ActiveRecord) {
    const { rootRuntimeContext, model } = this;
    const requestFields = rootRuntimeContext.getRequestModelFields();
    if (this.currentTriggerCreateAction && this.currentTriggerCreateAction.sessionPath) {
      return FunctionService.INSTANCE.simpleExecute<Record<string, unknown>>(
        model,
        functionDefinition,
        {
          requestFields,
          variables: {
            path: this.currentTriggerCreateAction?.sessionPath
          }
        },
        data
      );
    }
    return FunctionService.INSTANCE.simpleExecute<Record<string, unknown>>(
      model,
      functionDefinition,
      {
        requestFields
      },
      data
    );
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

  // region 分组

  /**
   * 分组视图数据源的总数量
   */
  @Widget.Reactive()
  protected groupTotalDataCount = 0;

  /**
   * 当前视图使用分组结构展示
   *  启动了分组并且有分组字段
   */
  @Widget.Provide()
  @Widget.Reactive()
  protected get enabledGroupView(): boolean {
    return this.groupable && !!this.groupList?.length;
  }

  /**
   * 分组视图底部展示「展开全部」操作
   */
  @Widget.Reactive()
  protected get groupViewFooterExpandControl() {
    if (this.enabledGroupView) {
      return this.groupTotalDataCount <= 300;
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
  protected groupList: IGroup[] | undefined = undefined;

  /**
   * 默认分组字段
   * @protected
   * @example "field00003,field00004"
   * @returns [field00003 desc,field00004 desc]
   */
  @Widget.Reactive()
  protected get grouping(): IGroup[] | undefined {
    const dsf: string = this.getDsl().grouping;
    if (dsf) {
      const dsfArr = dsf.split(ORDERING_SEPARATOR).filter((v) => !isEmpty(v));
      return dsfArr.map((v: string) => {
        const [groupField, groupDirection] = getSortFieldDirection(
          v,
          ORDERING_FIELD_ORDER_SEPARATOR,
          DEFAULT_ORDERING_ORDER
        );
        return { groupField, groupDirection };
      });
    }
    return undefined;
  }

  /**
   * 修改分组配置
   */
  @Widget.Provide()
  @Widget.Method()
  public onGroupChange(groupList: IGroup[]): void {
    const finalGroupList = groupList.length ? groupList : [];
    const groupParameters: UrlQueryParameters = {};
    if (finalGroupList?.length) {
      groupParameters.groupField = finalGroupList.map((v) => v.groupField).join(URL_SPLIT_SEPARATOR);
      groupParameters.groupDirection = finalGroupList.map((v) => v.groupDirection).join(URL_SPLIT_SEPARATOR);
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
      const groupFields = groupField.split(URL_SPLIT_SEPARATOR);
      const directions = groupDirection.split(URL_SPLIT_SEPARATOR);
      if (groupFields.length && directions.length && groupFields.length === directions.length) {
        for (let i = 0; i < groupFields.length; i++) {
          groupList.push({ groupField: groupFields[i], groupDirection: directions[i] as EDirection });
        }
      }
      this.groupList = groupList;
    } else if (!groupList && this.grouping?.length) {
      this.groupList = this.grouping;
    }
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

  protected columnWidgetMap: Map<string, ColumnWidgetEntity> = new Map();

  @Widget.Method()
  @Widget.Provide()
  protected fieldWidgetMounted(widget: BaseTableColumnWidget) {
    this.columnWidgetMap.set(widget.path, {
      widget,
      index: this.columnWidgetMap.size
    });
  }

  @Widget.Method()
  @Widget.Provide()
  protected fieldWidgetUnmounted(widget: BaseTableColumnWidget) {
    this.columnWidgetMap.delete(widget.path);
  }

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
    this.editRowCallChaining?.hook(this.path, (args) => {
      return this.editRow(args?.[0], args?.[1]);
    });
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    this.initGroupList();
    this.initSortConfig();
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.editRowCallChaining?.unhook(this.path);
  }
}
