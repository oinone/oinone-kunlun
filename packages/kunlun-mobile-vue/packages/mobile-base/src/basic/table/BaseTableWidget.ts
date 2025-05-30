import { DEFAULT_SLOT_NAME } from '@kunlun/dsl';
import {
  ActiveRecord,
  ActiveRecords,
  ActiveRecordsOperator,
  FunctionCache,
  FunctionMetadata,
  FunctionService,
  isRelation2MField,
  RuntimeFunctionDefinition,
  RuntimeM2MField,
  RuntimeO2MField,
  SubmitCacheManager,
  SubmitValue,
  translateValueByKey
} from '@kunlun/engine';
import { Expression, ExpressionRunParam } from '@kunlun/expression';
import { MessageHub } from '@kunlun/request';
import { BooleanHelper, Optional, ReturnPromise } from '@kunlun/shared';
import {
  ActiveEditorContext,
  OioTableInstance,
  RowContext,
  TableEditorCloseTrigger,
  TableEditorMode,
  TableEditorTrigger,
  VxeTableHelper
} from '../../ui';
import { ListPaginationStyle, ListSelectMode, OioNotification, StyleHelper } from '@kunlun/vue-ui-mobile-vant';
import { Widget } from '@kunlun/vue-widget';
import { cloneDeep, isEmpty, isEqual, isPlainObject } from 'lodash-es';
import { UserPreferService } from '../../service';
import { UserTablePrefer } from '../../typing';
import { FetchUtil } from '../../util';
import { BaseElementListViewWidget, BaseElementListViewWidgetProps } from '../element';
import { BaseTableColumnWidget } from '../table-column';
import { IFormSubviewListFieldWidget } from '../types';

interface ColumnWidgetEntity {
  widget: BaseTableColumnWidget;
  index: number;
}

function isActiveRecordArray(value: ActiveRecords): value is ActiveRecord[] {
  return Array.isArray(value);
}

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

  @Widget.Method()
  public onCheckedAllChange(selected: boolean, data: ActiveRecord[]) {
    super.onCheckedAllChange(selected, data);

    if (!selected) {
      this.getTableInstance()?.clearCheckboxRow();
    }
  }

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

  public initialize(props: Props) {
    if (!props.slotNames) {
      props.slotNames = [DEFAULT_SLOT_NAME];
    }
    super.initialize(props);
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

  // region 行内编辑

  /**
   * 启用行内编辑（对所有列均生效）
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get editable(): boolean | undefined {
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
      ((this.getDsl().editorTrigger as string)?.toLowerCase?.() as TableEditorTrigger) || TableEditorTrigger.manual
    );
  }

  /**
   * 行内编辑模式
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get editorMode(): TableEditorMode {
    return ((this.getDsl().editorMode as string)?.toLowerCase?.() as TableEditorMode) || TableEditorMode.cell;
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
      TableEditorCloseTrigger.manual
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
    if (this.tableInstance?.getActiveEditorRecord()) {
      return false;
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

  /**
   * 行编辑关闭前
   * @param context 行上下文
   * @private
   */
  @Widget.Method()
  @Widget.Provide()
  protected async rowEditorClosedBefore(context: RowContext): Promise<boolean> {
    const res = await this.rowEditorClosedForValidator(context);
    if (!res) {
      return false;
    }
    return res;
  }

  /**
   * 行编辑关闭
   * @param context 行上下文
   * @private
   */
  @Widget.Method()
  @Widget.Provide()
  protected async rowEditorClosed(context: RowContext | undefined): Promise<boolean> {
    if (!context) {
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
        this.updateSubviewFieldWidget(context, data);
      }
    } else if (data) {
      try {
        res = await this.rowEditorClosedForUpdate(context, data);
      } catch (e) {
        console.error(e);
        res = false;
      }
    }
    if (res) {
      await this.rowEditorClosedAfterProcess(context);
      this.lastedCurrentEditorContext = undefined;
    }
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

  protected updateSubviewFieldWidget(context: RowContext, data: ActiveRecord) {
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
    const data = (await this.submitCallChaining?.syncCall())?.records as ActiveRecord | undefined;
    if (data == null || isEmpty(data)) {
      console.warn('Invalid update data.');
      return context.data;
    }
    return data;
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

  protected async executeRowEditorUpdate(functionDefinition: RuntimeFunctionDefinition, data: ActiveRecord) {
    const { rootRuntimeContext, model } = this;
    const requestFields = rootRuntimeContext.getRequestModelFields();
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

  public executeExpression<T>(
    activeRecord: ActiveRecord | undefined,
    expression: string,
    errorValue?: T
  ): T | string | undefined {
    return Expression.run(
      {
        activeRecords: [activeRecord || {}],
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

  @Widget.Reactive()
  @Widget.Provide()
  protected userPrefer?: UserTablePrefer;

  protected initUserPrefer() {
    if (!this.inline) {
      this.userPrefer = UserPreferService.parsePreferForTable(
        this.metadataRuntimeContext.view?.extension?.userPreference as Record<string, unknown>
      );
    }
  }

  protected async $$executeRefreshCallChaining(args: unknown[] | undefined): Promise<void> {
    if (this.paginationStyle === ListPaginationStyle.SCROLL) {
      this.getTableInstance()?.getOrigin()?.scrollTo?.(0, 0);
    }

    super.$$executeRefreshCallChaining(args);
  }

  /**
   * 滚动加载的时候，距离底部10px就开始加载
   */
  @Widget.Reactive()
  public offsetScrollBottom = 10;

  /**
   * 表格滚动事件监听
   */
  @Widget.Method()
  public onScroll({ bodyHeight, scrollHeight, scrollTop, isX }) {
    if (this.paginationStyle !== ListPaginationStyle.SCROLL || isX) {
      return;
    }

    if (bodyHeight + scrollTop + this.offsetScrollBottom >= scrollHeight && this.pagination) {
      if (this.pagination.current < this.pagination.totalPageSize!) {
        this.pagination.current += 1;

        this.load(this.refreshProcess);
      }
    }
  }

  @Widget.Provide()
  @Widget.Method()
  public reloadUserPrefer(userPrefer: UserTablePrefer) {
    this.userPrefer = { ...(this.userPrefer || {}), ...userPrefer };
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    this.initUserPrefer();
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
  }
}
