import { ActionDslDefinition, DslDefinitionType, TemplateDslDefinition } from '@oinone/kunlun-dsl';
import { ActiveRecord, ActiveRecords } from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, NumberHelper, Optional, StringHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { DslDefinitionWidget, Widget } from '@oinone/kunlun-vue-widget';
import { ListPaginationStyle, ListSelectMode, PageSizeEnum } from '@oinone/kunlun-vue-ui-common';
import { isNil } from 'lodash-es';
import { ActionWidget } from '../../action/component/action';
import { BaseElementListViewWidgetProps, BaseElementWidget, BaseTableWidget } from '../../basic';
import { ActiveCountEnum, fetchPageSize, fetchPageSizeNullable, TABLE_WIDGET } from '../../typing';
import DefaultTable from './DefaultTable.vue';
import { TableRowClickMode } from './typing';
import { isTopViewWidget } from '../../util';

const CLICK_SLOT_NAME = 'click';

export interface TableWidgetProps extends BaseElementListViewWidgetProps {
  fixedHeight?: number | string | false;
}

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

  @Widget.Reactive()
  protected get checkbox(): boolean {
    if (this.inline) {
      return Optional.ofNullable(this.getDsl().checkbox).map(BooleanHelper.toBoolean).orElse(true)!;
    }

    return isTopViewWidget(this.metadataRuntimeContext) ? this.selectMode === ListSelectMode.checkbox : true;
  }

  @Widget.Reactive()
  protected get lineHeight(): number | undefined {
    return Optional.ofNullable(this.getDsl().lineHeight).map(NumberHelper.toNumber).orElse(undefined)!;
  }

  @Widget.Reactive()
  protected get enableSequence(): boolean {
    return Optional.ofNullable(this.getDsl().enableSequence).map(BooleanHelper.toBoolean).orElse(false)!;
  }

  protected scrollModelDefaultPageSize = PageSizeEnum.OPTION_3;

  @Widget.Reactive()
  protected get defaultPageSize(): number {
    let defaultPageSize = fetchPageSizeNullable(this.getDsl().defaultPageSize);
    if (isNil(defaultPageSize)) {
      defaultPageSize = fetchPageSize(this.metadataRuntimeContext.viewTemplate?.defaultPageSize);
    }

    /**
     * 如果是滚动加载，但是分页数量 <= 15条，那么就改为30条.
     *   否则在大屏手机上，15条数据无法盛满整个表格，无法触发表格的滚动事件
     */
    if (this.paginationStyle === ListPaginationStyle.SCROLL && defaultPageSize <= PageSizeEnum.OPTION_2) {
      return this.scrollModelDefaultPageSize;
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

  @Widget.Method()
  public onPaginationChange(current: number, pageSize: number): void {
    super.onPaginationChange(current, pageSize);
    this.expandRowIndexes = [];
  }

  @Widget.Reactive()
  protected get expandAccordion(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().expandAccordion) || false;
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected expandRowIndexes: number[] = [];

  @Widget.Reactive()
  protected get existExpandRow(): boolean {
    return !!this.expandRowIndexes?.length;
  }

  @Widget.Method()
  protected onToggleRowExpand({ expanded, rowIndex }) {
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

  @Widget.Method()
  protected onCurrentChange(e) {
    if (this.currentRow) {
      this.getTableInstance()?.setCurrentRow(this.currentRow);
    } else {
      this.getTableInstance()?.clearCurrentRow();
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
}
