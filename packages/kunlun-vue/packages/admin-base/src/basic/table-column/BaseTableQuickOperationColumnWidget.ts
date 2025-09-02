import { RowContext, TableFixed, VxeTableHelper, VxeTableRowContext } from '@oinone/kunlun-vue-ui';
import { ActiveRecordsWidgetProps, Widget } from '@oinone/kunlun-vue-widget';
import { createVNode, VNode } from 'vue';
import type { VxeTableConstructor, VxeTableDefines, VxeTableMethods, VxeTablePrivateMethods } from 'vxe-table';
import { UserPreferEventManager } from '../../service';
import { UserTablePrefer } from '../../typing';
import { BaseTableColumnWidget } from './BaseTableColumnWidget';
import DefaultQuickOperationColumn from './DefaultQuickOperationColumn.vue';
import Element from '../../tags/Element.vue';

export abstract class BaseTableQuickOperationColumnWidget<
  Value = unknown,
  Props extends ActiveRecordsWidgetProps = ActiveRecordsWidgetProps
> extends BaseTableColumnWidget<Value, Props> {
  @Widget.Method()
  public renderHeaderSlot(context: RowContext): VNode[] | string {
    const children = [createVNode('span', { class: 'oio-column-header-title' }, this.label)];
    const quickOperation = this.renderQuickOperation(context);
    if (quickOperation) {
      children.push(quickOperation);
    }
    const origin = (context as VxeTableRowContext).origin;
    const table = origin?.$table as VxeTableConstructor & VxeTablePrivateMethods & VxeTableMethods;
    const columns = table.getColumns();
    const isLastColumn = origin.$columnIndex === columns.length - 1;
    if (isLastColumn) {
      children.push(
        createVNode(Element, {
          widget: 'user-prefer',
          subPath: 'user-prefer',
          dslDefinition: { simple: (table.props?.customConfig as any)?.usingSimpleUserPrefer }
        })
      );
    }
    return children;
  }

  protected renderQuickOperation(context: RowContext): VNode | undefined {
    return createVNode(DefaultQuickOperationColumn, {
      table: (context as VxeTableRowContext).origin?.$table,
      column: (context as VxeTableRowContext).origin?.column,
      sortable: this.sortable,
      handleOrderByASC: this.handleOrderByASC,
      handleOrderByDESC: this.handleOrderByDESC,
      handleClearOrder: this.handleClearOrder,
      handleFreezeLeft: this.handleFreezeLeft,
      handleFreezeRight: this.handleFreezeRight,
      handleClearFreeze: this.handleClearFreeze,
      handleClearAllFreeze: this.handleClearAllFreeze,
      handleHide: this.handleHide
    });
  }

  @Widget.Method()
  protected handleOrderByASC(table: VxeTableConstructor & VxeTablePrivateMethods, column: VxeTableDefines.ColumnInfo) {
    const { field } = column;
    table.sort(field, 'asc');
    const params = { column, field, property: field, order: column.order, sortList: table.getSortColumns() };
    table.dispatchEvent('sort-change', params, null);
  }

  @Widget.Method()
  protected handleOrderByDESC(table: VxeTableConstructor & VxeTablePrivateMethods, column: VxeTableDefines.ColumnInfo) {
    const { field } = column;
    table.sort(field, 'desc');
    const params = { column, field, property: field, order: column.order, sortList: table.getSortColumns() };
    table.dispatchEvent('sort-change', params, null);
  }

  @Widget.Method()
  protected handleClearOrder(table: VxeTableConstructor & VxeTablePrivateMethods, column: VxeTableDefines.ColumnInfo) {
    const { field } = column;
    table.clearSort();
    const params = { column, field, property: field, order: column.order, sortList: table.getSortColumns() };
    table.dispatchEvent('sort-change', params, null);
  }

  @Widget.Method()
  protected async handleFreezeLeft(
    table: VxeTableConstructor & VxeTablePrivateMethods,
    column: VxeTableDefines.ColumnInfo
  ) {
    const { field } = column;
    if (!field) {
      return;
    }
    await this.consumerUserPreferManager(async (userPreferManager, userPrefer) => {
      const columns = VxeTableHelper.getFlatAllColumns(table.getTableColumn().collectColumn);
      const fixedFields: string[] = [];
      for (let i = 0; i < columns.length; i++) {
        const targetField = columns[i].field;
        if (!targetField) {
          continue;
        }
        fixedFields.push(targetField);
        if (targetField === field) {
          break;
        }
      }
      const fieldLeftFixed = fixedFields;
      await userPreferManager.save({ fieldLeftFixed });
      await userPreferManager.reload({ fieldLeftFixed });
    });
  }

  @Widget.Method()
  protected async handleFreezeRight(
    table: VxeTableConstructor & VxeTablePrivateMethods,
    column: VxeTableDefines.ColumnInfo
  ) {
    const { field } = column;
    if (!field) {
      return;
    }
    await this.consumerUserPreferManager(async (userPreferManager, userPrefer) => {
      const columns = VxeTableHelper.getFlatAllColumns(table.getTableColumn().collectColumn);
      const fixedFields: string[] = [];
      for (let i = columns.length - 1; i >= 0; i--) {
        const targetField = columns[i].field;
        if (!targetField) {
          continue;
        }
        fixedFields.push(targetField);
        if (targetField === field) {
          break;
        }
      }
      const fieldRightFixed = fixedFields;
      await userPreferManager.save({ fieldRightFixed });
      await userPreferManager.reload({ fieldRightFixed });
    });
  }

  @Widget.Method()
  protected async handleClearFreeze(
    table: VxeTableConstructor & VxeTablePrivateMethods,
    column: VxeTableDefines.ColumnInfo
  ) {
    const { field } = column;
    if (!field) {
      return;
    }
    await this.consumerUserPreferManager(async (userPreferManager, userPrefer) => {
      let fieldLeftFixed = userPrefer.fieldLeftFixed || [];
      const leftIndex = fieldLeftFixed.findIndex((v) => v === field);
      if (leftIndex >= 0) {
        fieldLeftFixed = [...fieldLeftFixed];
        fieldLeftFixed.splice(leftIndex, 1);
        await userPreferManager.save({
          fieldLeftFixed: fieldLeftFixed.length === 0 ? null : fieldLeftFixed
        } as UserTablePrefer);
        await userPreferManager.reload({ fieldLeftFixed });
        return;
      }
      let fieldRightFixed = userPrefer.fieldRightFixed || [];
      const rightIndex = fieldRightFixed.findIndex((v) => v === field);
      if (rightIndex >= 0) {
        fieldRightFixed = [...fieldRightFixed];
        fieldRightFixed.splice(rightIndex, 1);
        await userPreferManager.save({
          fieldRightFixed: fieldRightFixed.length === 0 ? null : fieldRightFixed
        } as UserTablePrefer);
        await userPreferManager.reload({ fieldRightFixed });
      }
    });
  }

  @Widget.Method()
  protected async handleClearAllFreeze(fixed: TableFixed = TableFixed.all) {
    await this.consumerUserPreferManager(async (userPreferManager, userPrefer) => {
      const saveUserPrefer = {} as UserTablePrefer;
      const reloadUserPrefer = {} as UserTablePrefer;
      switch (fixed) {
        case TableFixed.left:
          saveUserPrefer.fieldLeftFixed = null as unknown as string[];
          reloadUserPrefer.fieldLeftFixed = [];
          break;
        case TableFixed.right:
          saveUserPrefer.fieldRightFixed = null as unknown as string[];
          reloadUserPrefer.fieldRightFixed = [];
          break;
        case TableFixed.all:
          saveUserPrefer.fieldLeftFixed = null as unknown as string[];
          reloadUserPrefer.fieldLeftFixed = [];
          saveUserPrefer.fieldRightFixed = null as unknown as string[];
          reloadUserPrefer.fieldRightFixed = [];
          break;
      }
      await userPreferManager.save(saveUserPrefer);
      await userPreferManager.reload(reloadUserPrefer);
    });
  }

  @Widget.Method()
  protected async handleHide(table: VxeTableConstructor & VxeTablePrivateMethods, column: VxeTableDefines.ColumnInfo) {
    await this.consumerUserPreferManager(async (userPreferManager, userPrefer) => {
      if (!userPrefer.fieldPrefer) {
        return;
      }
      const { field } = column;
      if (userPrefer.fieldPrefer.includes(field)) {
        table.hideColumn(column);
        return;
      }
      const fieldPrefer = [...userPrefer.fieldPrefer, field];
      await userPreferManager.save({ fieldPrefer });
      await userPreferManager.reload({ fieldPrefer });
    });
  }

  @Widget.Method()
  protected consumerUserPreferManager<R>(
    fn: (userPreferManager: UserPreferEventManager, userPrefer: UserTablePrefer) => R
  ): R | undefined {
    const userPreferManager = UserPreferEventManager.getNullable(this.rootHandle || this.currentHandle);
    if (!userPreferManager) {
      return;
    }
    const userPrefer = userPreferManager.getData();
    if (!userPrefer) {
      return;
    }
    return fn(userPreferManager, userPrefer);
  }
}
