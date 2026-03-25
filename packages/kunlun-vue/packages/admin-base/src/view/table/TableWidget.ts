import { type ActionDslDefinition, DslDefinitionType, type TemplateDslDefinition } from '@oinone/kunlun-dsl';
import {
  type ActiveRecord,
  ActiveRecordExtendKeys,
  type ActiveRecords,
  ActiveRecordsOperator,
  ConditionWrapper,
  GenericFunctionService,
  GroupingData,
  GroupingField,
  GroupStatisticsEnum,
  isM2MField,
  isRelation2OField,
  isRelationField,
  type Pagination,
  type QueryContext,
  QueryService,
  QuerySort,
  type QueryVariables,
  type RuntimeModelField,
  type RuntimeRelationField,
  type TableGroupingPageOptions,
  TableGroupingQueryService,
  type TableGroupingWrapperOptions,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { type Entity, ViewType } from '@oinone/kunlun-meta';
import { Condition } from '@oinone/kunlun-request';
import { DEFAULT_TRUE_CONDITION, ISort } from '@oinone/kunlun-service';
import { BigNumber, BooleanHelper, NumberHelper, Optional, StringHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import {
  type ActiveEditorContext,
  GROUP_TREE_KEY,
  TableEditorCloseTrigger,
  TableEditorMode,
  TableRowClickMode,
  VxeTableHelper
} from '@oinone/kunlun-vue-ui';
import { EmptyStyle, StyleHelper } from '@oinone/kunlun-vue-ui-antd';
import { DslDefinitionWidget, Widget } from '@oinone/kunlun-vue-widget';
import { delay, find, isBoolean, isNaN, isNil, isNumber, isPlainObject, isString, toNumber, toString } from 'lodash-es';
import { nextTick } from 'vue';
import { VxeTableDefines } from 'vxe-table';
import { ActionWidget } from '../../action/component/action';
import {
  type BaseElementListViewWidgetProps,
  BaseElementWidget,
  BaseTableColumnWidget,
  BaseTableWidget
} from '../../basic';
import { ExpandColumnWidgetNames } from '../../field';
import {
  ActiveCountEnum,
  fetchPageSize,
  fetchPageSizeNullable,
  TABLE_WIDGET,
  TableLineHeightEnum,
  type UserTablePrefer
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
  protected currentLineHeight: number | undefined;

  @Widget.Method()
  protected onLineHeightChange(lineHeight: number | undefined) {
    this.currentLineHeight = lineHeight;
  }

  @Widget.Reactive()
  protected get lineHeight(): string | number | undefined {
    const { lineHeight } = this.tableConfig;
    if (lineHeight != null) {
      return this.computeLineHeight(lineHeight);
    }
    if (this.currentLineHeight == null) {
      return this.computeLineHeight(this.defaultBasicLineHeight);
    }
    return this.computeLineHeight(this.currentLineHeight);
  }

  /**
   * 默认基准行高，切换行高时以该值作为计算基准
   * @protected
   */
  @Widget.Reactive()
  protected get defaultBasicLineHeight(): number {
    return Optional.ofNullable(this.getDsl().defaultBasicLineHeight).map(NumberHelper.toNumber).orElse(48);
  }

  /**
   * 根据行高类型计算行高
   * @param lineHeight 行高
   * @protected
   */
  protected computeLineHeight(lineHeight: number | string): string | number | undefined {
    if (typeof lineHeight === 'string' && lineHeight.endsWith('px')) {
      lineHeight = lineHeight.substring(0, lineHeight.length - 2);
    }
    const basicLineHeight = NumberHelper.toNumber(lineHeight);
    if (basicLineHeight == null) {
      return StyleHelper.px(lineHeight) as string;
    }
    const { lineHeightType } = this;
    if (lineHeightType == null) {
      return basicLineHeight;
    }
    switch (lineHeightType) {
      case TableLineHeightEnum.SMALL:
        return basicLineHeight - this.computeLineHeightOffset(TableLineHeightEnum.SMALL);
      case TableLineHeightEnum.MIDDLE:
        return basicLineHeight;
      case TableLineHeightEnum.LARGE:
        return basicLineHeight + this.computeLineHeightOffset(TableLineHeightEnum.LARGE);
      case TableLineHeightEnum.AUTO:
        return undefined;
    }
    return basicLineHeight;
  }

  /**
   * 计算行高偏移量，切换行高时通过类型获取偏移量
   * @protected
   */
  protected computeLineHeightOffset(lineHeightType: TableLineHeightEnum.SMALL | TableLineHeightEnum.LARGE): number {
    return 8;
  }

  @Widget.Reactive()
  protected get minLineHeight(): number | undefined {
    return Optional.ofNullable(this.tableConfig.minLineHeight).map(NumberHelper.toNumber).orElse(undefined);
  }

  @Widget.Reactive()
  protected get border() {
    return this.tableConfig.border || false;
  }

  @Widget.Reactive()
  protected get stripe() {
    return this.tableConfig.stripe || false;
  }

  @Widget.Reactive()
  protected get isCurrent() {
    return this.tableConfig.isCurrent || true;
  }

  @Widget.Reactive()
  protected get isHover() {
    return this.tableConfig.isHover || false;
  }

  /**
   * 表格行高是否自适应，默认开启
   */
  @Widget.Reactive()
  protected get autoLineHeight(): boolean {
    const { lineHeightType } = this;
    if (lineHeightType === TableLineHeightEnum.AUTO) {
      return true;
    }
    if (!lineHeightType || lineHeightType === TableLineHeightEnum.DEFAULT) {
      const { autoLineHeight } = this.tableConfig;
      return Optional.ofNullable(autoLineHeight).map(BooleanHelper.toBoolean).orElse(true);
    }
    return false;
  }

  @Widget.Reactive()
  protected get lineHeightType(): TableLineHeightEnum | undefined {
    return this.viewState?.lineHeightType as TableLineHeightEnum | undefined;
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
    const { activeCount } = this.tableConfig;
    if (isNil(activeCount)) {
      return undefined;
    }
    const activeCountNumber = NumberHelper.toNumber(activeCount as number | undefined | string);
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
    let { inlineActiveCount } = this.tableConfig;
    if (isNil(inlineActiveCount)) {
      inlineActiveCount = this.metadataRuntimeContext.viewTemplate?.inlineActiveCount;
      if (isNil(inlineActiveCount)) {
        return undefined;
      }
    }
    const inlineActiveCountNumber = NumberHelper.toNumber(inlineActiveCount as number | string);
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

  @Widget.Reactive()
  protected get allowAllChecked() {
    if (this.readyToAllCheckedCount > 200) {
      return translateValueByKey('表格最多支持勾选200条');
    }
    return true;
  }

  @Widget.Reactive()
  protected get isAllCheckedIndeterminate(): boolean | undefined {
    const total = this.readyToAllCheckedCount;
    if (total === -1) {
      return undefined;
    }
    const checkedCount = this.activeRecords?.length || 0;
    if (checkedCount > 0 && checkedCount < total) {
      return true;
    }
    return undefined;
  }

  @Widget.Method()
  protected checkMethod(params: { row: ActiveRecord }): boolean | string | undefined {
    const { row } = params;
    if (this.enabledGroupView) {
      const res = this.checkMethodByGroup(params);
      if (res != null) {
        return res;
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

  protected checkMethodByGroup({ row }: { row: ActiveRecord }): boolean | string | undefined {
    const children = row[GROUP_TREE_KEY.CHILDREN_KEY] as object[];
    if (children) {
      if (!!children.length) {
        if (row[GROUP_TREE_KEY.IS_LEAF_KEY]) {
          if (children.length > 200) {
            return translateValueByKey('表格最多支持勾选200条');
          }
          return true;
        }
        if (this.hasExpandedGroupNode(children)) {
          if (this.computeReadyToCheckedCount(children) > 200) {
            return translateValueByKey('表格最多支持勾选200条');
          }
          return true;
        }
      }
      return translateValueByKey('请展开分组后再批量勾选');
    }
  }

  protected hasExpandedGroupNode(children: object[]): boolean {
    return children.some((v) => {
      const cc = v[GROUP_TREE_KEY.CHILDREN_KEY] as object[];
      if (cc) {
        if (!!cc.length) {
          if (v[GROUP_TREE_KEY.IS_LEAF_KEY]) {
            return true;
          }
          if (this.hasExpandedGroupNode(cc)) {
            return true;
          }
        }
        return false;
      }
      return true;
    });
  }

  @Widget.Reactive()
  protected get readyToAllCheckedCount(): number {
    if (this.enabledGroupView) {
      return this.computeReadyToCheckedCount(this.dataSource || []);
    }
    return -1;
  }

  protected computeReadyToCheckedCount(children: object[]): number {
    let total = 0;
    for (const child of children) {
      const cc = child[GROUP_TREE_KEY.CHILDREN_KEY] as object[];
      if (cc) {
        const ccNext = cc[GROUP_TREE_KEY.CHILDREN_KEY] as object[];
        if (ccNext) {
          total += this.computeReadyToCheckedCount(cc);
        } else {
          total += cc.length;
        }
        continue;
      }
      break;
    }
    return total;
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
  public onGroupChange(groupList: GroupingField[]): void {
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
    this.onAddRowEvent({ insertTo: 0 });
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
    if (this.enabledTreeConfig && !this.enabledGroupView) {
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

  // region 数据分组

  @Widget.Reactive()
  @Widget.Provide()
  protected get enableGrouping() {
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

  protected getGroupFieldValues(list: ActiveRecord[], targetRow: ActiveRecord, index = 0): GroupingField[] {
    for (const item of list) {
      if (item === targetRow) {
        return [this.getGroupFieldValue(item, index)];
      }
      const children = item[GROUP_TREE_KEY.CHILDREN_KEY] as ActiveRecord[];
      if (children?.length) {
        const nextFields = this.getGroupFieldValues(children, targetRow, index + 1);
        if (nextFields.length) {
          return [this.getGroupFieldValue(item, index), ...nextFields];
        }
      }
    }
    return [];
  }

  protected getGroupFieldValue(row: ActiveRecord, index: number): GroupingField {
    const field = this.groupList?.[index];
    if (!field || !this.expandTreeFieldColumn) {
      throw new Error('Invalid group field.');
    }
    return {
      ...field,
      value: row[this.expandTreeFieldColumn]
    };
  }

  /**
   * 初始化分组展开字段
   */
  protected initGroupTreeField() {
    if (this.enableGrouping) {
      this.expandTreeField = this.model.modelFields.find((v) => !v.invisible);
    }
  }

  protected generatorGroupQueryCondition(condition?: Condition): Record<string, unknown> {
    const variables = this.generatorQueryVariables();
    const context = this.generatorQueryContext();
    const searchBody = this.generatorSearchBody();
    const finalCondition = this.generatorCondition(condition, this.usingSearchCondition);
    const orders: QuerySort[] | undefined = this.sortList?.map((item) => ({
      field: item.sortField,
      direction: item.direction
    }));
    let sort: { orders: QuerySort[] } | undefined;
    if (orders) {
      sort = { orders };
    }

    const queryWrapper: ConditionWrapper = {
      model: this.model.model,
      rsql: finalCondition.toString(),
      sort,
      queryData: searchBody
    };

    return {
      fields: this.groupList || [],
      queryWrapper,
      sort: this.sortList,
      variables,
      context
    };
  }

  /**
   * 查询分组下对应的数据源（懒加载）
   */
  @Widget.Provide()
  @Widget.Method()
  protected async loadGroupData(row: ActiveRecord) {
    const fields = this.getGroupFieldValues(this.dataSource || [], row);
    if (fields.length) {
      const requestFields = this.generatorRequestFields();
      return TableGroupingQueryService.queryGroupingDataByWrapper(this.model, {
        requestFields,
        responseFields: requestFields,
        ...this.generatorGroupQueryCondition(),
        fields
      } as TableGroupingWrapperOptions);
    }
    return [];
  }

  @Widget.Provide()
  @Widget.Method()
  protected async loadGroupStatistics(
    row: ActiveRecord,
    field: RuntimeModelField,
    groupStatistics: GroupStatisticsEnum
  ): Promise<string | undefined> {
    const fields = this.getGroupFieldValues(this.dataSource || [], row);
    if (fields.length) {
      const requestFields = this.generatorRequestFields();
      return TableGroupingQueryService.queryGroupingStatistic(this.model, {
        requestFields,
        responseFields: [],
        ...this.generatorGroupQueryCondition(),
        fields,
        statisticField: {
          field: field.data,
          statisticMethod: groupStatistics
        }
      });
    }
  }

  /**
   * 查询分组分页数据
   */
  protected async loadGroupPage(condition?: Condition) {
    const pagination = this.generatorPagination();
    const responseFields = this.generatorRequestFields();
    const result = await TableGroupingQueryService.queryGroupingPage(this.model, {
      currentPage: this.pagination?.current || 1,
      pageSize: this.showPagination ? pagination.pageSize : -1,
      responseFields,
      ...this.generatorGroupQueryCondition(condition)
    } as TableGroupingPageOptions);
    this.groupingExpandedAll = result.expandedAll;
    pagination.total = toNumber(result?.totalElements);
    pagination.totalPageSize = toNumber(result?.totalPages);
    return this.generatorGroupTree(result?.groups);
  }

  protected generatorGroupTree(groups?: GroupingData[]) {
    return (
      groups?.map((g) => {
        if (g.groups?.length) {
          return {
            [this.expandTreeFieldColumn as string]: this.parseGroupValue(g),
            [GROUP_TREE_KEY.IS_LEAF_KEY]: g.isLeaf,
            [GROUP_TREE_KEY.PROPS_KEY]: g,
            [GROUP_TREE_KEY.CHILDREN_KEY]: this.generatorGroupTree(g.groups)
          };
        }

        const children = g.data ? JSON.parse(g.data || '[]') : [];
        return {
          [this.expandTreeFieldColumn as string]: this.parseGroupValue(g),
          [GROUP_TREE_KEY.IS_LEAF_KEY]: g.isLeaf,
          [GROUP_TREE_KEY.PROPS_KEY]: g,
          [GROUP_TREE_KEY.CHILDREN_KEY]: children
        };
      }) || []
    );
  }

  protected parseGroupValue(groupingData: GroupingData): unknown {
    const { isJsonValue, value } = groupingData;
    if (isJsonValue && typeof value === 'string') {
      const objectValue = JSON.parse(value);
      groupingData.value = objectValue;
      return objectValue;
    }
    return value;
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
    let isEnabled = false;
    const columnWidget = this.getColumnWidgets().find((v) => v.itemData === field);
    if (columnWidget && columnWidget.editable) {
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
    const { lastedCurrentEditorContext } = this;
    if (!lastedCurrentEditorContext) {
      return;
    }
    const { rowIndex, columnIndex } = lastedCurrentEditorContext;
    const allColumns = this.tableInstance?.getAllColumns() || [];
    let nextColumnIndex = columnIndex + offset;
    let nextColumn = allColumns[nextColumnIndex];
    if (!nextColumn) {
      return;
    }

    while (!nextColumn.field || nextColumn.field === '$$internalOperator' || !nextColumn.visible) {
      nextColumnIndex += offset;
      nextColumn = allColumns[nextColumnIndex % allColumns.length];
    }

    let row = await this.tableInstance?.getTableData(rowIndex);
    if (nextColumnIndex < 0 || nextColumnIndex >= allColumns.length) {
      const nextRow = await this.tableInstance?.getTableData(rowIndex + Math.sign(offset));
      if (!nextRow) {
        // fixme @zbh 20251024 创建新行并激活编辑态
        // const records = ActiveRecordsOperator.repairRecords([{}]);
        // await this.tableInstance?.clearEditor();
        // const { row: newRow } = await this.tableInstance?.insert(records);
        // nextRow = newRow;
      }
      row = nextRow;
    }
    const isEnabled =
      row &&
      nextColumn &&
      nextColumn.field &&
      this.getCellEditable(nextColumn.field, row, rowIndex + (row ? offset : 0));
    if (!isEnabled) {
      return this.onMoveColumnActiveEditor(event, offset + offset);
    }

    if (
      !lastedCurrentEditorContext.editorMode &&
      this.editorMode === TableEditorMode.cell &&
      this.editorCloseTrigger === TableEditorCloseTrigger.auto
    ) {
      lastedCurrentEditorContext.editorMode = TableEditorMode.row;
    }

    lastedCurrentEditorContext.column = nextColumn;
    lastedCurrentEditorContext.columnIndex = nextColumnIndex;

    // 如果是换行编辑，那么需要下一行可编辑项的第一个默认选中，并且修改激活行的数据
    nextTick(async () => {
      await this.tableInstance?.activeCellEditor(row, nextColumn.field);
    });
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
