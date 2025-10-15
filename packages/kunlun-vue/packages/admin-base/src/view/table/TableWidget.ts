import { ActionDslDefinition, DslDefinitionType, TemplateDslDefinition } from '@oinone/kunlun-dsl';
import {
  ActiveRecord,
  ActiveRecordExtendKeys,
  ActiveRecords,
  ActiveRecordsOperator,
  GenericFunctionService,
  isM2MField,
  isRelation2OField,
  isRelationField,
  Pagination,
  QueryContext,
  QueryGroupsValue,
  QueryService,
  QueryVariables,
  RuntimeModelField,
  RuntimeRelationField,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { Entity, ViewType } from '@oinone/kunlun-meta';
import { Condition } from '@oinone/kunlun-request';
import { DEFAULT_TRUE_CONDITION, IGroup, ISort } from '@oinone/kunlun-service';
import { BigNumber, BooleanHelper, NumberHelper, Optional, StringHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import {
  ActiveEditorContext,
  GROUP_TREE_KEY,
  RowContext,
  TableEditorMode,
  TableEditorTrigger,
  TableRowClickMode,
  VxeTableHelper
} from '@oinone/kunlun-vue-ui';
import { EmptyStyle, StyleHelper } from '@oinone/kunlun-vue-ui-antd';
import { DslDefinitionWidget, Widget } from '@oinone/kunlun-vue-widget';
import { delay, find, isBoolean, isNaN, isNil, isNumber, isPlainObject, isString, toNumber, toString } from 'lodash-es';
import { nextTick } from 'vue';
import { VxeTableDefines } from 'vxe-table';
import { ActionWidget } from '../../action/component/action';
import { BaseElementListViewWidgetProps, BaseElementWidget, BaseTableColumnWidget, BaseTableWidget } from '../../basic';
import { ExpandColumnWidgetNames } from '../../field';
import { fetchGroupData, fetchGroupPage, fetchGroupStatistic, GroupStatisticsEnum } from '../../service';
import {
  ActiveCountEnum,
  fetchPageSize,
  fetchPageSizeNullable,
  TABLE_WIDGET,
  TableLineHeightEnum,
  TableLineHeightMap,
  UserTablePrefer
} from '../../typing';
import { TreeUtils } from '../../util';
import DefaultTable from './DefaultTable.vue';

const CLICK_SLOT_NAME = 'click';

export interface TableWidgetProps extends BaseElementListViewWidgetProps {
  fixedHeight?: number | string | false;
}

const RESET_EXPAND_ROW_INDEXES = [-1];

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Table,
    widget: ['table', TABLE_WIDGET]
  })
)
export class TableWidget<Props extends TableWidgetProps = TableWidgetProps> extends BaseTableWidget<Props> {
  protected currentRow: ActiveRecord | undefined;

  public initialize(props: Props) {
    super.initialize(props);
    this.setComponent(DefaultTable);
    return this;
  }

  /**
   * 表格底部开启「添加一行」操作
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected showAddBtn = false;

  /**
   * 表格底部开启「快速填报」操作
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected showQuickFill = false;

  @Widget.Provide()
  protected get cellWidth() {
    // fixme @zbh 20250723 请使用语义明确的dsl属性名称
    const { autoColumnWidth } = this.getDsl();
    if (autoColumnWidth) {
      return 'auto';
    }
  }

  @Widget.Provide()
  protected get cellMinWidth() {
    // fixme @zbh 20250723 请使用语义明确的dsl属性名称
    const { minFieldWidth } = this.getDsl();
    if (minFieldWidth) {
      return StyleHelper.px(minFieldWidth) as string;
    }
  }

  @Widget.Reactive()
  protected get checkbox(): boolean {
    return Optional.ofNullable(this.getDsl().checkbox).map(BooleanHelper.toBoolean).orElse(true)!;
  }

  @Widget.Reactive()
  protected get lineHeight(): number | undefined {
    if (this.lineHeightType && this.lineHeightType !== TableLineHeightEnum.DEFAULT) {
      return TableLineHeightMap[this.lineHeightType];
    }

    const lineHeight = Optional.ofNullable(this.getDsl().lineHeight).map(NumberHelper.toNumber).orElse(undefined);

    if (lineHeight) {
      return lineHeight;
    }

    if (typeof this.tableConfig.lineHeight === 'number') {
      return this.tableConfig.lineHeight;
    }

    return undefined;
  }

  @Widget.Reactive()
  protected get minLineHeight(): number | undefined {
    const minLineHeight = Optional.ofNullable(this.getDsl().minLineHeight).map(NumberHelper.toNumber).orElse(undefined);

    if (minLineHeight) {
      return minLineHeight;
    }

    if (typeof this.tableConfig.minLineHeight === 'number') {
      return this.tableConfig.minLineHeight;
    }

    return undefined;
  }

  /**
   * 表格行高是否自适应，默认开启
   */
  @Widget.Reactive()
  protected get autoLineHeight(): boolean {
    if (this.lineHeightType === TableLineHeightEnum.AUTO) {
      return true;
    }
    const autoLineHeight = Optional.ofNullable(this.getDsl().autoLineHeight)
      .map(BooleanHelper.toBoolean)
      .orElse(undefined);

    if (typeof autoLineHeight === 'boolean') {
      return autoLineHeight;
    }

    if (typeof this.tableConfig.autoLineHeight === 'boolean') {
      return this.tableConfig.autoLineHeight;
    }

    return true;
  }

  @Widget.Provide()
  @Widget.Reactive()
  protected lineHeightType = TableLineHeightEnum.DEFAULT;

  @Widget.Provide()
  @Widget.Method()
  protected setLineHeightType(value: TableLineHeightEnum) {
    this.lineHeightType = value;
  }

  @Widget.Reactive()
  protected get enableSequence(): boolean {
    return Optional.ofNullable(this.getDsl().enableSequence)
      .map(BooleanHelper.toBoolean)
      .orElse(this.defaultEnableSequence);
  }

  protected get defaultEnableSequence() {
    const { enableSequence } = this.tableConfig;
    if (enableSequence == null) {
      return false;
    }
    return enableSequence;
  }

  @Widget.Reactive()
  protected get defaultPageSize(): number {
    let defaultPageSize = fetchPageSizeNullable(this.getDsl().defaultPageSize);
    if (isNil(defaultPageSize)) {
      defaultPageSize = fetchPageSize(this.metadataRuntimeContext.viewTemplate?.defaultPageSize);
    }
    return defaultPageSize;
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected get activeCount(): number | undefined {
    const { activeCount } = this.getDsl();
    if (isNil(activeCount)) {
      return undefined;
    }
    const activeCountNumber = NumberHelper.toNumber(activeCount);
    if (isNil(activeCountNumber)) {
      return ActiveCountEnum[activeCount as string];
    }
    return activeCountNumber;
  }

  /**
   * @deprecated 使用activeCount
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get inlineActiveCount(): number | undefined {
    let { inlineActiveCount } = this.getDsl();
    if (isNil(inlineActiveCount)) {
      inlineActiveCount = this.metadataRuntimeContext.viewTemplate?.inlineActiveCount;
      if (isNil(inlineActiveCount)) {
        return undefined;
      }
    }
    const inlineActiveCountNumber = NumberHelper.toNumber(inlineActiveCount);
    if (isNil(inlineActiveCountNumber)) {
      return ActiveCountEnum[inlineActiveCount as string];
    }
    return inlineActiveCountNumber;
  }

  @Widget.Reactive()
  protected get allowChecked(): string | boolean | undefined {
    const val = this.getDsl().allowChecked;
    if (val == null) {
      return true;
    }
    const booleanCheckbox = BooleanHelper.toBoolean(val);
    if (booleanCheckbox != null) {
      return booleanCheckbox;
    }
    return val as string;
  }

  @Widget.Method()
  protected checkMethod({ row }: { row: ActiveRecord }): boolean | string | undefined {
    if (this.enabledGroupView) {
      const children = row[GROUP_TREE_KEY.CHILDREN_KEY] as unknown[];
      if (children) {
        if (!!children.length) {
          return true;
        }
        return '请展开子节点确认数据后再进行选中';
      }
    }
    const { allowChecked } = this;
    if (isNil(allowChecked)) {
      return true;
    }
    if (isBoolean(allowChecked)) {
      return allowChecked;
    }
    if (isString(allowChecked)) {
      return this.executeExpression<boolean>(row, allowChecked, false);
    }
    return true;
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected get operatorColumnDirection() {
    return this.getDsl().operatorColumnDirection;
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected get operatorColumnWidth() {
    return this.getDsl().operatorColumnWidth;
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected get operatorColumnButtonType() {
    return this.getDsl().operatorColumnButtonType;
  }

  @Widget.Method()
  public onPaginationChange(current: number, pageSize: number): void {
    super.onPaginationChange(current, pageSize);
    this.resetExpandRowAttr();
  }

  @Widget.Method()
  @Widget.Provide()
  public onSortChange(sortList: ISort[]): void {
    super.onSortChange(sortList);
    this.resetExpandRowAttr();
  }

  @Widget.Method()
  @Widget.Provide()
  public onGroupChange(groupList: IGroup[]): void {
    super.onGroupChange(groupList);
    this.resetExpandRowAttr();
  }

  protected resetExpandRowAttr() {
    if (!this.existingExpandElement) {
      return;
    }

    this.lazyExistExpandRow = this.existExpandRow;
    this.expandRowIndexes = [...RESET_EXPAND_ROW_INDEXES];
  }

  @Widget.Reactive()
  protected get expandAccordion(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().expandAccordion) || false;
  }

  /**
   * 单元格合并
   *
   * {@link https://vxetable.cn/v4.6/#/table/api}
   */
  @Widget.Reactive()
  protected get mergeCells() {
    return undefined;
  }

  /**
   * 虚拟滚动 横向滚动配置
   *
   * {@link https://vxetable.cn/v4.6/#/table/api}
   */
  @Widget.Reactive()
  protected get scrollX() {
    return { gt: -1 };
  }

  /**
   * 虚拟滚动 纵向滚动配置
   *
   * {@link https://vxetable.cn/v4.6/#/table/api}
   */
  @Widget.Reactive()
  protected get scrollY() {
    return { gt: -1 };
  }

  /**
   * 是否存在展开行
   */
  @Widget.Reactive()
  protected get existingExpandElement() {
    const widgets = this.template?.widgets || [];
    return !!widgets.find((w) => ExpandColumnWidgetNames.includes(w.widget) && w.widgets && w.widgets.length);
  }

  @Widget.Reactive()
  protected get expandAll() {
    return BooleanHelper.toBoolean(this.getDsl().expandAll) || false;
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected get expandOperationField() {
    return this.getDsl().expandOperationField;
  }

  @Widget.Reactive()
  protected expandRowIndexes: number[] = [];

  @Widget.Reactive()
  protected lazyExistExpandRow = false;

  @Widget.Reactive()
  @Widget.Provide()
  protected get existExpandRow(): boolean {
    if (this.expandAll) {
      return true;
    }
    if (this.isResetExpandRowIndexes()) {
      return this.lazyExistExpandRow;
    }
    return !!this.expandRowIndexes?.length;
  }

  protected isResetExpandRowIndexes(): boolean {
    return (
      Optional.ofNullable(this.expandRowIndexes)
        .filter((v) => v.length === 1)
        .map((v) => v[0])
        .orElse(undefined) === RESET_EXPAND_ROW_INDEXES[0]
    );
  }

  protected resetExpandRowIndexes(init?: boolean) {
    /**
     * 当表格不存在展开行的时候，不需要执行下列逻辑，防止表格列重新刷新
     */
    if (!this.existingExpandElement) {
      if (this.expandRowIndexes && this.expandRowIndexes.length === 0) {
        return;
      }

      this.expandRowIndexes = [];
      return;
    }

    let forceInit = false;
    if (!init && this.isResetExpandRowIndexes()) {
      forceInit = true;
    }
    if (this.expandAll) {
      const maxIndex = this.showDataSource?.length;
      if (maxIndex != null) {
        const expandRowIndexes: number[] = [];
        for (let i = 0; i < maxIndex; i++) {
          expandRowIndexes.push(i);
        }
        this.expandRowIndexes = expandRowIndexes;
        if (!init) {
          this.getTableInstance()?.allRowExpand();
        }
      } else if (forceInit || init) {
        this.expandRowIndexes = [];
        nextTick(() => {
          this.getTableInstance()?.refreshColumn();
        });
      }
    } else if (forceInit || init) {
      this.expandRowIndexes = [];
      nextTick(() => {
        this.getTableInstance()?.refreshColumn();
      });
    }
  }

  @Widget.Reactive()
  protected get allowExpand(): string | boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().allowExpand);
  }

  @Widget.Method()
  protected expandMethod({ row }: { row: ActiveRecord }) {
    if (this.enabledGroupView) {
      if (!!row[GROUP_TREE_KEY.CHILDREN_KEY]) {
        return false;
      }
    }
    const { allowExpand } = this;
    if (isNil(allowExpand)) {
      return true;
    }
    if (isBoolean(allowExpand)) {
      return allowExpand;
    }
    if (isString(allowExpand)) {
      return this.executeExpression<boolean>(row, allowExpand, false);
    }
    return true;
  }

  @Widget.Method()
  protected onToggleRowExpand({ expanded, rowIndex }) {
    if (this.treeConfig) {
      if (expanded) {
        this.expandRowIndexes = [0];
      } else {
        this.expandRowIndexes = [...RESET_EXPAND_ROW_INDEXES];
      }
      return;
    }
    const expandIndex = this.expandRowIndexes.findIndex((v) => v === rowIndex);
    if (expanded) {
      if (this.expandAccordion) {
        this.expandRowIndexes = [rowIndex];
      } else if (expandIndex === -1) {
        this.expandRowIndexes.push(rowIndex);
      }
    } else if (expandIndex !== -1) {
      this.expandRowIndexes.splice(expandIndex, 1);
    }
  }

  /**
   * 当列宽拖动发生变化时, 需要将字段对应的宽度保存到用户偏号
   */
  @Widget.Method()
  protected async onResizableChange({ column }) {
    const userPrefer = this.userPrefer || ({} as UserTablePrefer);
    const { field, resizeWidth } = column;

    if (!field) {
      return;
    }

    const fieldWidth = [...(userPrefer.fieldWidth || []).map((v) => ({ ...v }))];

    const index = fieldWidth.findIndex((f) => f.field === field);
    if (index >= 0) {
      fieldWidth[index].width = resizeWidth;
    } else {
      fieldWidth.push({ field, width: resizeWidth });
    }
    await this.userPreferEventManager?.reload({ fieldWidth });
    await this.userPreferEventManager?.save({ fieldWidth: fieldWidth.length ? fieldWidth : null } as UserTablePrefer);
  }

  @Widget.Reactive()
  protected get showFooter(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().showFooter);
  }

  @Widget.Method()
  protected footerMethod({ columns, data }: { columns: VxeTableDefines.ColumnInfo[]; data: ActiveRecord[] }) {
    if (!this.dataSource) {
      return [translateValueByKey(this.statisticsLabel)];
    }
    return [this.generatorStatisticsRow(columns, data)];
  }

  @Widget.Reactive()
  protected get statisticsLabel(): string {
    return Optional.ofNullable(this.getDsl().statisticsLabel).map(toString).orElse(translateValueByKey('合计'));
  }

  @Widget.Reactive()
  protected get skipStatisticsText(): string {
    return '';
  }

  @Widget.Reactive()
  protected get emptyStatisticsText(): string {
    return Optional.ofNullable(this.getDsl().emptyStatisticsText).map(toString).orElse('0');
  }

  @Widget.Reactive()
  protected get statisticsFun(): string | undefined {
    return this.getDsl().statisticsFun;
  }

  @Widget.Reactive()
  protected get refreshRemoteStatistics(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().refreshRemoteStatistics);
  }

  protected statistics(statisticalValues: unknown[], statistics: string): string {
    return this.emptyStatisticsText;
  }

  protected generatorStatisticsRow(columns: VxeTableDefines.ColumnInfo[], data: ActiveRecord[]): string[] {
    const { statisticsLabel, statisticsFun, remoteStatisticsRow } = this;
    if (statisticsFun) {
      if (!remoteStatisticsRow) {
        this.remoteStatistics(columns, statisticsFun);
      }
      return remoteStatisticsRow || [statisticsLabel];
    }
    return this.generatorStatisticsRow0(columns, (statisticsRow, columnWidget, columnStatistics) => {
      const statisticalValues = data
        .map((value, index) =>
          columnWidget.getOperator<BaseTableColumnWidget>().compute({
            key: VxeTableHelper.getKey(value),
            data: value,
            index,
            origin: null
          })
        )
        .filter((v) => !!v);
      if (!statisticalValues.length) {
        statisticsRow.push(this.emptyStatisticsText);
        return;
      }
      if (columnStatistics) {
        statisticsRow.push(this.statistics(statisticalValues, columnStatistics));
      } else {
        statisticsRow.push(this.statisticsBySum(statisticalValues));
      }
    });
  }

  protected statisticsBySum(statisticalValues: unknown[]) {
    const statisticalValue = statisticalValues.reduce((a, b) => {
      const sum = NumberHelper.add(a as number, b as number);
      if (isNaN(sum)) {
        return b;
      }
      return sum;
    });
    let numberValue: BigNumber | null | undefined;
    if (isNumber(statisticalValue) || isString(statisticalValue)) {
      numberValue = NumberHelper.toBigNumber(statisticalValue);
    }
    if (!numberValue || numberValue.isNaN()) {
      return this.emptyStatisticsText;
    }
    return numberValue.toString();
  }

  @Widget.Reactive()
  protected remoteStatisticsRow: string[] | undefined;

  protected async remoteStatistics(columns: VxeTableDefines.ColumnInfo[], fun: string): Promise<void> {
    const { statisticsLabel } = this;
    const result = await this.fetchStatisticsResult(columns, fun);
    if (!result || !isPlainObject(result)) {
      this.remoteStatisticsRow = [statisticsLabel];
      return;
    }
    this.remoteStatisticsRow = this.generatorStatisticsRow0(columns, (statisticsRow, columnWidget) => {
      const statisticalValue = result[columnWidget.itemData];
      if (statisticalValue == null) {
        statisticsRow.push(this.skipStatisticsText);
        return;
      }
      let numberValue: BigNumber | null | undefined;
      if (isNumber(statisticalValue) || isString(statisticalValue)) {
        numberValue = NumberHelper.toBigNumber(statisticalValue);
      }
      if (!numberValue || numberValue.isNaN()) {
        statisticsRow.push(this.skipStatisticsText);
        return;
      }
      statisticsRow.push(numberValue.toString());
    });
    this.getTableInstance()?.updateFooter();
  }

  protected fetchStatisticsResult(
    columns: VxeTableDefines.ColumnInfo[],
    fun: string,
    ...args: unknown[]
  ): Promise<Record<string, unknown> | undefined> {
    const requestFields = this.generatorRequestFields();
    if (!args.length) {
      const finalCondition = this.generatorCondition();
      const finalPagination = this.generatorPagination();
      const finalSort = this.generatorQuerySort();
      const { queryWrapper, pagination } = QueryService.buildQueryPageParameters({
        requestFields,
        responseFields: requestFields,
        currentPage: finalPagination.current,
        pageSize: this.showPagination ? finalPagination.pageSize : -1,
        sort: finalSort,
        condition: finalCondition.toString() === DEFAULT_TRUE_CONDITION ? '' : finalCondition
      });
      args = [queryWrapper, pagination];
    }
    return GenericFunctionService.INSTANCE.executeByFun<Record<string, unknown>>(
      this.model.model,
      fun,
      {
        requestFields
      },
      ...args
    );
  }

  protected generatorStatisticsRow0(
    columns: VxeTableDefines.ColumnInfo[],
    fn: (statisticsRow: string[], columnWidget: BaseTableColumnWidget, columnStatistics: string | undefined) => void
  ) {
    // 合计的标题需要单独占一列，复选框和序列同时都不展示的时候不能展示合计标题列
    const statisticsRow: string[] = this.checkbox === false && !this.enableSequence ? [] : [this.statisticsLabel];
    if (this.checkbox !== false && this.enableSequence) {
      statisticsRow.push(this.skipStatisticsText);
    }

    for (const column of columns) {
      if (!!column.type || !column.visible) {
        continue;
      }
      const columnWidgetHandle = column.params?.handle;
      const columnStatistics = column.params?.template?.statistics;
      if (!columnWidgetHandle || columnStatistics == null) {
        statisticsRow.push(this.skipStatisticsText);
        continue;
      }
      const isStatistics = BooleanHelper.toBoolean(columnStatistics);
      const isCustomStatistics = isStatistics == null && isString(columnStatistics);
      if (!isStatistics && !isCustomStatistics) {
        statisticsRow.push(this.skipStatisticsText);
        continue;
      }
      const columnWidget = Widget.select(columnWidgetHandle);
      if (!columnWidget) {
        statisticsRow.push(this.skipStatisticsText);
        continue;
      }
      if (!(columnWidget instanceof BaseTableColumnWidget)) {
        statisticsRow.push(this.skipStatisticsText);
        continue;
      }
      fn(statisticsRow, columnWidget, isCustomStatistics ? columnStatistics : undefined);
    }
    return statisticsRow;
  }

  @Widget.Reactive()
  protected get rowClickActionDslDefinition(): ActionDslDefinition | undefined {
    const { rowClickActionName, widgets } = this.getDsl();
    const clickTemplateDslDefinition = widgets?.find(
      (v) => v.dslNodeType === DslDefinitionType.TEMPLATE && (v as TemplateDslDefinition).slot === CLICK_SLOT_NAME
    );
    if (clickTemplateDslDefinition) {
      let clickDslDefinition: ActionDslDefinition | undefined;
      if (rowClickActionName) {
        clickDslDefinition = clickTemplateDslDefinition.widgets?.find(
          (v) => v.dslNodeType === DslDefinitionType.ACTION && (v as ActionDslDefinition).name === rowClickActionName
        ) as ActionDslDefinition;
      } else if (clickTemplateDslDefinition.widgets?.length === 1) {
        return clickTemplateDslDefinition.widgets?.[0] as ActionDslDefinition;
      }
      return clickDslDefinition;
    }
  }

  @Widget.Reactive()
  protected get rowDblClickActionDslDefinition(): ActionDslDefinition | undefined {
    const { rowDblClickActionName, widgets } = this.getDsl();
    const clickTemplateDslDefinition = widgets?.find(
      (v) => v.dslNodeType === DslDefinitionType.TEMPLATE && (v as TemplateDslDefinition).slot === CLICK_SLOT_NAME
    );
    if (clickTemplateDslDefinition) {
      let clickDslDefinition: ActionDslDefinition | undefined;
      if (rowDblClickActionName) {
        clickDslDefinition = clickTemplateDslDefinition.widgets?.find(
          (v) => v.dslNodeType === DslDefinitionType.ACTION && (v as ActionDslDefinition).name === rowDblClickActionName
        ) as ActionDslDefinition;
      } else if (clickTemplateDslDefinition.widgets?.length === 1) {
        return clickTemplateDslDefinition.widgets?.[0] as ActionDslDefinition;
      }
      return clickDslDefinition;
    }
  }

  @Widget.Reactive()
  protected get allowRowClick(): boolean {
    if (!!this.rowClickActionDslDefinition || !!this.rowDblClickActionDslDefinition) {
      return true;
    }
    const allowRowClick = BooleanHelper.toBoolean(this.getDsl().allowRowClick);
    return !!(allowRowClick || !this.rowClickMode || this.rowClickMode.length);
  }

  @Widget.Reactive()
  protected get rowClickMode(): TableRowClickMode[] | undefined {
    return StringHelper.convertArray(this.getDsl().rowClickMode)?.map((v) => v.toLowerCase()) as TableRowClickMode[];
  }

  /**
   * 添加一行
   */
  @Widget.Method()
  protected onAddRow() {
    this.onAddRowEvent({});
  }

  @Widget.Method()
  protected onCurrentChange(e) {
    if (this.currentRow) {
      this.getTableInstance()?.setCurrentRow(this.currentRow);
    } else {
      this.getTableInstance()?.clearCurrentRow();
    }
  }

  /**
   * 整行、全表编辑开启时，点击单元格需要记录最新的行+单元格数据
   */
  @Widget.Method()
  protected onCellClick(context: ActiveEditorContext) {
    if (this.lastedCurrentEditorContext && [TableEditorMode.row, TableEditorMode.table].includes(this.editorMode)) {
      this.lastedCurrentEditorContext.column = context.column;
      this.lastedCurrentEditorContext.columnIndex = context.columnIndex;
    }
  }

  @Widget.Method()
  protected async onRowClick({ column, row }) {
    if (!column?.field || !this.allowRowClick) {
      return;
    }
    const actionName = this.rowClickActionDslDefinition?.name;
    if (actionName) {
      this.currentRow = row;
      this.getTableInstance()?.setCurrentRow(row);
      await this.clickActionWidget(row, actionName);
    }
  }

  @Widget.Method()
  protected async onRowDblClick({ column, row }) {
    if (!column?.field || !this.allowRowClick) {
      return;
    }
    const actionName = this.rowClickActionDslDefinition?.name || this.rowDblClickActionDslDefinition?.name;
    if (actionName) {
      this.currentRow = row;
      this.getTableInstance()?.setCurrentRow(row);
      await this.clickActionWidget(row, actionName);
    }
  }

  protected async clickActionWidget(activeRecords: ActiveRecords, actionName: string) {
    const actionWidget = this.getChildren()?.find((v) => {
      if (v instanceof DslDefinitionWidget) {
        const slotName = v.getSlotName();
        if (slotName === CLICK_SLOT_NAME && v instanceof ActionWidget) {
          return v.action?.name === actionName;
        }
      }
      return false;
    }) as ActionWidget;
    if (actionWidget) {
      this.reloadActiveRecords?.(activeRecords);
      await actionWidget.click();
      actionWidget.forceUpdate();
    }
  }

  // region tree-config

  @Widget.Reactive()
  protected internalEnabledTreeConfig: boolean | undefined;

  protected treeRelationField: RuntimeRelationField | undefined;

  @Widget.Reactive()
  protected expandTreeField: RuntimeModelField | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected get expandTreeFieldColumn() {
    return this.expandTreeField?.data;
  }

  protected getEnabledTreeConfig(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().enabledTreeConfig);
  }

  /**
   * 默认展开所有子孙树节点（只会在初始化时被触发一次）
   * @protected
   */
  protected getTreeExpandAll(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().treeExpandAll) || false;
  }

  /**
   * 是否使用懒加载（启用后只有指定 hasChild 字段的节点才允许被点击）
   * @protected
   */
  protected getTreeLazy(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().treeLazy) || true;
  }

  /**
   * 判断树的节点是否有子节点的字段配置
   * @protected
   */
  protected getTreeHasChildField(): string {
    return this.getDsl().treeHasChildField || ActiveRecordExtendKeys.HAS_CHILDREN;
  }

  protected getTreeRelationField() {
    const { treeRelationField } = this.getDsl();
    if (!treeRelationField) {
      return undefined;
    }
    return this.model.modelFields.find((v): v is RuntimeRelationField => {
      if (v.data === treeRelationField && isRelationField(v)) {
        const { relationFields, referenceFields } = v;
        if (relationFields?.length && referenceFields?.length) {
          return true;
        }
      }
      return false;
    });
  }

  protected getExpandTreeField(): RuntimeModelField | undefined {
    const { expandTreeField } = this.getDsl();
    if (!expandTreeField) {
      return undefined;
    }
    return this.model.modelFields.find((v) => v.data === expandTreeField);
  }

  protected initTreeConfig() {
    this.internalEnabledTreeConfig = this.getEnabledTreeConfig();

    if (!this.internalEnabledTreeConfig) {
      return;
    }

    this.treeRelationField = this.getTreeRelationField();
    this.expandTreeField = this.getExpandTreeField();
  }

  @Widget.Reactive()
  protected get enabledTreeConfig(): boolean {
    const { internalEnabledTreeConfig, treeRelationField, expandTreeField } = this;
    return !!(internalEnabledTreeConfig && treeRelationField && expandTreeField && !isM2MField(treeRelationField));
  }

  @Widget.Reactive()
  protected get treeConfig() {
    if (this.enabledTreeConfig) {
      return {
        transform: true,
        rowField: ActiveRecordExtendKeys.DRAFT_ID,
        parentField: ActiveRecordExtendKeys.PARENT_DRAFT_ID,
        hasChild: this.getTreeHasChildField(),
        expandAll: this.getTreeExpandAll(),
        lazy: this.getTreeLazy(),
        loadMethod: ({ row }) => {
          return this.loadTreeNodes(undefined, row);
        }
      };
    }
    if (this.enableGrouping) {
      return {
        rowField: ActiveRecordExtendKeys.DRAFT_ID,
        parentField: ActiveRecordExtendKeys.PARENT_DRAFT_ID,
        hasChild: GROUP_TREE_KEY.IS_LEAF_KEY,
        expandAll: this.groupViewFooterExpandControl,
        children: GROUP_TREE_KEY.CHILDREN_KEY,
        lazy: !this.groupViewFooterExpandControl,
        loadMethod: async ({ row }) => {
          return this.loadGroupData(row);
        }
      };
    }
    return undefined;
  }

  protected async loadTreeNodes(condition?: Condition, currentRow?: ActiveRecord) {
    let parentDraftId: string | undefined;
    if (currentRow) {
      parentDraftId = currentRow[this.treeConfig!.parentField] as string;
      const treeRelationField = this.treeRelationField as RuntimeRelationField;
      let targetCondition: Condition | undefined;
      const res = await TreeUtils.consumerReferenceModelField(
        this.model.model,
        treeRelationField,
        (originFields, targetFields, index) => {
          const value = currentRow[originFields[index]];
          const key = targetFields[index];
          if (targetCondition) {
            targetCondition.and(TreeUtils.newCondition(key, value));
          } else {
            targetCondition = TreeUtils.newCondition(key, value);
          }
        }
      );
      if (res) {
        if (!condition) {
          condition = new Condition(DEFAULT_TRUE_CONDITION);
        }
        if (targetCondition) {
          condition.and(targetCondition);
        }
      }
    } else {
      const treeRelationField = this.treeRelationField as RuntimeRelationField;
      let targetCondition: Condition | undefined;
      const res = await TreeUtils.consumerReferenceModelField(
        this.model.model,
        treeRelationField,
        (originFields, targetFields, index) => {
          const key = targetFields[index];
          if (targetCondition) {
            targetCondition.and(TreeUtils.newCondition(key, null));
          } else {
            targetCondition = TreeUtils.newCondition(key, null);
          }
        }
      );
      if (res) {
        if (!condition) {
          condition = new Condition(DEFAULT_TRUE_CONDITION);
        }
        if (targetCondition) {
          condition.and(targetCondition);
        }
      }
    }
    const children = ActiveRecordsOperator.repairRecords(await this.$$loadTreeNodes(condition, currentRow), {
      parentDraftId,
      hasChildren: true
    });
    if (!children.length && currentRow) {
      currentRow[this.treeConfig!.hasChild] = false;
    }
    return children;
  }

  public async $$loadTreeNodes(condition?: Condition, currentRow?: ActiveRecord): Promise<Entity[]> {
    const finalCondition = this.generatorCondition(condition, this.usingSearchCondition);
    if (this.usingSearchCondition) {
      this.generatorSearchCondition(finalCondition);
    }
    const pagination = this.generatorPagination();
    const sort = this.generatorQuerySort();
    const variables = this.generatorQueryVariables();
    const context = this.generatorQueryContext();
    let results: Entity[];
    if (currentRow) {
      results = await this.queryAllTreeNodeChildren(finalCondition, pagination, sort, variables, context);
    } else {
      const result = await this.queryPage(finalCondition, pagination, sort, variables, context);
      pagination.total = result.totalElements;
      pagination.totalPageSize = result.totalPages;
      results = ActiveRecordsOperator.repairRecords(result.content);
      this.buildTreeTableDataSource(results);
    }
    return results;
  }

  protected buildTreeTableDataSource(dataList: ActiveRecord[]): void {
    if (this.treeRelationField && isRelation2OField(this.treeRelationField)) {
      const { relationFields, referenceFields } = this.treeRelationField;
      dataList.forEach((a) => {
        const matchesObj = referenceFields.reduce((acc, field, index) => {
          acc[field] = a[relationFields[index]];
          return acc;
        }, {});
        const findParent = find(dataList, matchesObj);
        if (findParent) {
          // findParent[this.treeConfig!.hasChild] = true;
          a[this.treeConfig!.parentField] = findParent[this.treeConfig!.rowField];
        }
      });
    }
  }

  protected async queryAllTreeNodeChildren(
    condition: Condition,
    pagination: Pagination,
    sort: ISort[],
    variables: QueryVariables,
    context: QueryContext
  ): Promise<ActiveRecord[]> {
    const pageSize = 200;
    const firstPage = await this.queryPage(
      condition,
      {
        ...pagination,
        current: 1,
        pageSize
      },
      sort,
      variables,
      context
    );
    const { totalPages, content } = firstPage;
    if (totalPages <= 1) {
      return content;
    }
    const results: Promise<ActiveRecord[]>[] = [];
    for (let i = 2; i <= totalPages; i++) {
      results.push(
        this.queryPage(
          condition,
          {
            ...pagination,
            current: i,
            pageSize
          },
          sort,
          variables,
          {
            ...context,
            batch: true
          }
        ).then((res) => res.content)
      );
    }
    const res = await Promise.all(results);
    res.forEach((v) => content.push(...v));
    return content;
  }

  // endregion

  // region 行内编辑

  @Widget.Method()
  @Widget.Provide()
  protected async rowEditorClosed(context: RowContext | undefined): Promise<boolean> {
    const res = await super.rowEditorClosed(context);
    if (this.treeConfig && !this.inline && res) {
      this.refreshProcess();
    }
    return res;
  }

  // endregion

  // region 数据分组

  @Widget.Reactive()
  @Widget.Provide()
  protected get enableGrouping() {
    if (this.enabledTreeConfig) {
      return false;
    }
    return super.enableGrouping;
  }

  /**
   * 展开、关闭所有的分组
   *
   */
  @Widget.Method()
  protected setAllGroupExpand(expand: boolean) {
    if (!this.enabledGroupView) {
      return;
    }

    // 如果全部展开，但是展开全部功能未启动，则不处理
    if (expand && !this.groupViewFooterExpandControl) {
      return;
    }

    this.tableInstance?.getOrigin().setAllTreeExpand(expand);
  }

  protected findGroupTreePath = (list, targetRow, path = [] as any[]) => {
    for (const item of list) {
      const newPath = [...path, item];
      if (item === targetRow) {
        return newPath;
      }
      if (item?.[GROUP_TREE_KEY.CHILDREN_KEY]?.length) {
        const result = this.findGroupTreePath(item[GROUP_TREE_KEY.CHILDREN_KEY], targetRow, newPath);
        if (result) {
          return result;
        }
      }
    }
    return null;
  };

  /**
   * 初始化分组展开字段
   */
  protected initGroupTreeField() {
    if (this.enableGrouping) {
      this.expandTreeField = this.rootRuntimeContext.model.modelFields.find((v) => !v.invisible);
    }
  }

  protected generatorGroupQueryCondition(paging?: boolean) {
    const variables = this.generatorQueryVariables();
    const context = this.generatorQueryContext();
    const searchBody = this.generatorSearchBody();
    const condition = this.generatorCondition(undefined, this.usingSearchCondition);

    const sort = { orders: this.sortList?.map((item) => ({ field: item.sortField, direction: item.direction })) };

    const queryWrapper: Record<string, unknown> = {
      queryData: searchBody,
      rsql: condition.toString()
    };

    const parameters: Record<string, unknown> = {
      model: this.model.model,
      groupFields: this.groupList?.map((v) => ({ field: v.groupField, orderType: v.groupDirection })) || [],
      queryWrapper,
      variables,
      context
    };

    if (paging) {
      parameters.sort = sort;
    } else {
      queryWrapper.sort = sort;
    }

    return parameters as any;
  }

  /**
   * 查询分组下对应的数据源（懒加载）
   */
  @Widget.Provide()
  @Widget.Method()
  protected async loadGroupData(row: ActiveRecord) {
    const path = this.findGroupTreePath(this.dataSource, row);
    if (path?.length) {
      const result = await fetchGroupData({
        expandGroupPaths: [{ nodeList: path.map((v) => v[GROUP_TREE_KEY.PROPS_KEY]) }],
        ...this.generatorGroupQueryCondition()
      });

      return JSON.parse(result.expandGroupDataStr?.[0] || '[]');
    }
    return [];
  }

  @Widget.Provide()
  @Widget.Method()
  protected async loadGroupStatistics(
    row: ActiveRecord,
    field: RuntimeModelField,
    groupStatistics: GroupStatisticsEnum
  ): Promise<ActiveRecord> {
    const path = this.findGroupTreePath(this.dataSource, row);
    if (path?.length) {
      const result = await fetchGroupStatistic({
        expandGroupPaths: [
          {
            nodeList: path.map((v) => v[GROUP_TREE_KEY.PROPS_KEY]),
            statisticFieldMap: { [field.data]: groupStatistics }
          }
        ],
        ...this.generatorGroupQueryCondition()
      });

      return JSON.parse(result.expandGroupDataStr?.[0] || '[]');
    }
    return {};
  }

  /**
   * 查询分组分页数据
   */
  protected async loadGroupPage(condition?: Condition) {
    const pagination = this.generatorPagination();

    const result = await fetchGroupPage({
      deep: this.groupList?.length || 1,
      currentPage: this.pagination?.current || 1,
      size: this.showPagination ? pagination.pageSize : -1,
      ...this.generatorGroupQueryCondition(true)
    });

    this.groupTotalDataCount = toNumber(result?.totalDataCount || 0);

    pagination.total = toNumber(result?.totalElements);
    pagination.totalPageSize = toNumber(result?.totalPages);

    return this.generatorGroupTree(result?.groups);
  }

  protected generatorGroupTree(groups?: QueryGroupsValue[]) {
    return (
      groups?.map((g) => {
        if (g.groups?.length) {
          return {
            [this.expandTreeFieldColumn as string]: g.value,
            [GROUP_TREE_KEY.IS_LEAF_KEY]: g.isLeaf,
            [GROUP_TREE_KEY.PROPS_KEY]: g,
            [GROUP_TREE_KEY.CHILDREN_KEY]: this.generatorGroupTree(g.groups)
          };
        }

        const children = g.dataListStr ? JSON.parse(g.dataListStr || '[]') : [];
        return {
          [this.expandTreeFieldColumn as string]: g.value,
          [GROUP_TREE_KEY.IS_LEAF_KEY]: g.isLeaf,
          [GROUP_TREE_KEY.PROPS_KEY]: g,
          [GROUP_TREE_KEY.CHILDREN_KEY]: children
        };
      }) || []
    );
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected get groupTitleEmptyStyle() {
    return this.getDsl().groupTitleEmptyStyle || EmptyStyle.empty;
  }

  // endregion

  // region 合并单元格

  @Widget.Method()
  protected spanMethod({ row }: { row: ActiveRecord }): { rowspan: number; colspan: number } | undefined {
    return undefined;
  }

  // endregion

  // region 快捷键操作

  /**
   * 键盘事件处理
   */
  @Widget.Method()
  protected onKeydown({ $event: event }: { $event: KeyboardEvent }) {
    if (!this.currentEditorContext) {
      return;
    }
    const fn = this.matchKeyboardFunction(event);
    if (fn) {
      fn.bind(this)(event);
    }
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

  protected onKeyboardMoveToRightCell(event: KeyboardEvent) {
    event.preventDefault();
    this.onMoveColumnActiveEditor(event, 1);
  }

  protected onKeyboardMoveToLeftCell(event: KeyboardEvent) {
    event.preventDefault();
    this.onMoveColumnActiveEditor(event, -1);
  }

  protected onKeyboardMoveToDownCell(event: KeyboardEvent) {
    event.preventDefault();
    this.onMoveRowActiveEditor(event, 1);
  }

  protected onKeyboardMoveToUpCell(event: KeyboardEvent) {
    event.preventDefault();
    this.onMoveRowActiveEditor(event, -1);
  }

  protected onKeyboardEnter(event: KeyboardEvent) {
    // const activeRow = this.getTableInstance()?.getActiveEditorRecord();
    // if (activeRow) {
    //   const input = (activeRow.origin as { cell?: HTMLElement }).cell?.querySelector('input');
    //   if (input) {
    //     if (input !== document.activeElement) {
    //       return;
    //     }
    //   }
    // }
    event.preventDefault();
    this.tableInstance?.clearEditor();
  }

  protected onKeyboardCancel(event: KeyboardEvent) {
    event.preventDefault();
    this.currentEditorContext!.submit = false;
    this.tableInstance?.clearEditor();
  }

  protected getCellEditable(field: string, row: ActiveRecord, rowIndex: number) {
    let isEnabled = true;
    const columnWidget = this.getColumnWidgets().find((v) => v.itemData === field);
    if (
      columnWidget &&
      columnWidget.editable &&
      columnWidget.editorTrigger !== TableEditorTrigger.manual &&
      columnWidget.editorMode === TableEditorMode.cell
    ) {
      isEnabled = columnWidget.cellEditable({
        key: VxeTableHelper.getKey(row),
        data: row,
        index: rowIndex,
        origin: row
      });
    }
    return isEnabled;
  }

  /**
   * 单元格左右移动
   */
  protected async onMoveColumnActiveEditor(event: KeyboardEvent, offset: number) {
    const { rowIndex, columnIndex } = this.lastedCurrentEditorContext!;
    const allColumns = this.tableInstance?.getAllColumns() || [];
    let nextColumnIndex = columnIndex + offset;
    let nextColumn = allColumns[nextColumnIndex];
    if (!nextColumn) {
      return;
    }
    let row = await this.tableInstance?.getTableData(rowIndex);
    let toNextRow = false;

    while (!nextColumn.field || nextColumn.field === '$$internalOperator' || !nextColumn.visible) {
      nextColumnIndex += offset;
      nextColumn = allColumns[nextColumnIndex % allColumns.length];
    }

    if (nextColumnIndex < 0 || nextColumnIndex >= allColumns.length) {
      toNextRow = true;
      row = await this.tableInstance?.getTableData(rowIndex + Math.sign(offset));
    }
    const isEnabled =
      row &&
      nextColumn &&
      nextColumn.field &&
      this.getCellEditable(nextColumn.field, row, rowIndex + (row ? offset : 0));
    if (!isEnabled) {
      return this.onMoveColumnActiveEditor(event, offset + offset);
    }

    if (this.lastedCurrentEditorContext) {
      this.lastedCurrentEditorContext.column = nextColumn;
      this.lastedCurrentEditorContext.columnIndex = nextColumnIndex;
    }

    // 如果是换行编辑，那么需要下一行可编辑项的第一个默认选中，并且修改激活行的数据
    if (toNextRow) {
      delay(() => {
        const context = this.getTableInstance()?.getActiveEditorRecord()?.origin as ActiveEditorContext;

        if (context) {
          this.activeEditor({ ...context, editableMap: {} });
        }
      }, 200);
    } else {
      // 否则直接切换对应单元格的焦点
      // this.lastedCurrentEditorContext = {
      //   prepare: true,
      //   editorMode: TableEditorMode.row,
      //   editorCloseTrigger: TableEditorCloseTrigger.auto,
      //   forceEditable: true
      // } as ActiveEditorContext;
      nextTick(async () => {
        await this.tableInstance?.activeCellEditor(row, nextColumn.field);
      });
    }
  }

  /**
   * 上下移动
   */
  protected async onMoveRowActiveEditor(event: KeyboardEvent, offset: 1 | -1) {
    const { column, rowIndex } = this.lastedCurrentEditorContext!;
    const { field } = column;
    if (field) {
      const currentIndex = rowIndex + offset;
      const currentRow = this.showDataSource![currentIndex];
      const isEnabled = this.getCellEditable(field, currentRow, currentIndex);
      if (!currentRow || !isEnabled) {
        return;
      }

      await this.tableInstance?.activeCellEditor(currentRow, field);

      delay(() => {
        const context = this.getTableInstance()?.getActiveEditorRecord()?.origin as ActiveEditorContext;

        if (context) {
          this.activeEditor({ ...context, editableMap: {} });
        }
      }, 200);
    }
  }

  // endregion

  public async fetchData(condition?: Condition): Promise<ActiveRecord[]> {
    const searchBody = this.generatorSearchBody();
    this.internalEnabledTreeConfig =
      this.getEnabledTreeConfig() && (!(searchBody && Object.keys(searchBody).length) || !this.showPagination);
    const { enabledTreeConfig } = this;

    /**
     * 分组请求
     */
    if (this.enabledGroupView) {
      return this.load(() => this.loadGroupPage(condition));
    }

    /**
     * 树行表格
     */
    if (enabledTreeConfig) {
      return this.load(() => this.loadTreeNodes(condition));
    }

    /**
     * 默认请求
     */
    return super.fetchData(condition);
  }

  protected async mountedProcess() {
    await super.mountedProcess();
    this.resetExpandRowIndexes(true);
  }

  protected async refreshProcess(condition?: Condition) {
    await super.refreshProcess(condition);
    this.resetExpandRowIndexes();
    this.refreshStatistics();
    this.refreshTree();
    this.setAllGroupExpand(true);
  }

  protected refreshTree() {
    if (this.getTreeExpandAll()) {
      this.getTableInstance()?.getOrigin().setAllTreeExpand(true);
    }
  }

  protected refreshStatistics() {
    if (this.refreshRemoteStatistics && this.statisticsFun) {
      this.remoteStatisticsRow = undefined;
      this.getTableInstance()?.updateFooter();
    }
  }

  protected $$beforeCreated() {
    this.initTreeConfig();
    super.$$beforeCreated();
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    this.initGroupTreeField();
  }
}
