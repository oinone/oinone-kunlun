<script lang="ts">
import { StringHelper } from '@oinone/kunlun-shared';
import { OioEmptyData, OioSpin, PropRecordHelper } from '@oinone/kunlun-vue-ui-mobile-vant';
import { isNil } from 'lodash-es';
import { computed, createVNode, defineComponent, ref, VNode } from 'vue';
import { Column as VxeColumn, Table as VxeTable, VxeTableDefines, VxeTableInstance } from 'vxe-table';
import { DEFAULT_PREFIX } from '../../../theme';
import { VXE_TABLE_X_ID } from '../constant';
import { useProviderOioTableInstance } from '../context';
import { CheckedChangeEvent, RadioChangeEvent, SortChangeEvent } from '../event';
import { ActiveEditorContext, OioTableInstance, RowContext } from '../typing';
import { OioTableProps } from './props';
import { TableSize } from './typing';

const events = {
  onCellClick: 'cell-click',
  onCellDblclick: 'cell-dblclick',
  onHeaderCellClick: 'header-cell-click',
  onHeaderCellDblclick: 'header-cell-dblclick',
  onFooterCellClick: 'footer-cell-click',
  onFooterCellDblclick: 'footer-cell-dblclick',
  onToggleRowExpand: 'toggle-row-expand',
  onEditActived: 'edit-actived',
  onEditClosed: 'edit-closed',
  onEditDisabled: 'edit-disabled',
  onScroll: 'scroll',
  onCurrentChange: 'current-change'
};

interface VxeTableSortEvent {
  field: string;
  order: 'asc' | 'desc' | null;
  property: string;

  sortList: {
    field: string;
    order: 'asc' | 'desc';
    property: string;
  }[];
}

export default defineComponent({
  name: 'OioTable',
  components: {
    VxeTable,
    VxeColumn,
    OioSpin
  },
  inheritAttrs: false,
  props: {
    ...OioTableProps
  },
  emits: ['sort-change', 'checked-change', 'checked-all-change', 'radio-change', ...Object.values(events)],
  setup(props, context) {
    const vxeTable = ref<VxeTableInstance>();

    const size = computed(() => {
      if (props.size == null) {
        return undefined;
      }
      switch (props.size) {
        case TableSize.large:
          return 'medium';
        case TableSize.middle:
          return 'small';
        case TableSize.small:
          return 'mini';
      }
      return undefined;
    });

    const onEvents = {};
    Object.entries(events).forEach(([key, event]) => {
      onEvents[key] = (...args) => {
        context.emit(event, ...args);
      };
    });

    const onSortChange = (e: VxeTableSortEvent) => {
      const { field, order, sortList } = e;
      const sorts = sortList.map((sort) => ({
        origin: sort,
        field: sort.field,
        direction: sort.order!
      }));
      let event: SortChangeEvent;
      if (order) {
        event = {
          origin: e,
          field,
          direction: order,
          sorts
        };
      } else {
        event = {
          origin: e,
          field,
          direction: false,
          sorts
        };
      }
      context.emit('sort-change', event);
    };

    const onCheckedChange = (e) => {
      const { checked, record, records } = e;
      const event: CheckedChangeEvent = {
        checked,
        record,
        records,
        origin: e
      };
      context.emit('checked-change', event);
    };

    const onCheckedAllChange = (e) => {
      const { checked, record, records } = e;
      const event: CheckedChangeEvent = {
        checked,
        record,
        records,
        origin: e
      };
      context.emit('checked-all-change', event);
    };

    const onRadioChange = (e) => {
      const { oldValue, newValue } = e;
      const event: RadioChangeEvent = {
        oldRecord: oldValue,
        newRecord: newValue,
        origin: e
      };
      context.emit('radio-change', event);
    };

    const onEditorEvent = (eventKey: string, eventParams: VxeTableDefines.EditActivedEventParams) => {
      const event: ActiveEditorContext = {
        row: eventParams.row,
        rowIndex: eventParams.rowIndex,
        column: {
          field: eventParams.column.field
        },
        columnIndex: eventParams.columnIndex,
        editableMap: {},
        submit: true,
        origin: eventParams
      };
      // context.emit(eventKey, event);
    };

    const onEditActived = (eventParams: VxeTableDefines.EditActivedEventParams) => {
      onEditorEvent('edit-actived', eventParams);
    };

    const onEditClosed = (eventParams: VxeTableDefines.EditActivedEventParams) => {
      onEditorEvent('edit-closed', eventParams);
    };

    const tableInstance: OioTableInstance = {
      getOrigin() {
        return vxeTable.value!;
      },
      setCurrentRow(row) {
        return vxeTable.value!.setCurrentRow(row);
      },
      clearCurrentRow() {
        return vxeTable.value!.clearCurrentRow();
      },
      setCheckboxRow(rows, checked) {
        return vxeTable.value!.setCheckboxRow(rows, checked);
      },
      clearCheckboxRow() {
        return vxeTable.value!.clearCheckboxRow();
      },
      resetCheckboxRow(rows) {
        vxeTable.value!.clearCheckboxRow();
        return vxeTable.value!.setCheckboxRow(rows, true);
      },
      setRadioRow(row: unknown) {
        return vxeTable.value!.setRadioRow(row);
      },
      clearRadioRow() {
        return vxeTable.value!.clearRadioRow();
      },
      getAllColumns() {
        return vxeTable.value!.getTableColumn().collectColumn;
      },
      refreshColumn() {
        return vxeTable.value!.refreshColumn();
      },
      loadColumns(columns) {
        return vxeTable.value!.loadColumn(columns);
      },
      reloadColumns(columns) {
        return vxeTable.value!.reloadColumn(columns);
      },
      setEditRow(row) {
        return vxeTable.value!.setEditRow(row);
      },
      getActiveEditorRecord(): RowContext | undefined {
        const editRecord = vxeTable.value!.getEditRecord();
        if (!editRecord) {
          return undefined;
        }
        const { row, rowIndex } = editRecord;
        return {
          key: row.__draftId || row[VXE_TABLE_X_ID],
          data: row,
          index: rowIndex,
          origin: editRecord
        };
      },
      activeCellEditor(row, fieldOrColumn: string | VxeTableDefines.ColumnInfo) {
        return vxeTable.value!.setEditCell(row, fieldOrColumn);
      },
      clearEditor() {
        return vxeTable.value!.clearActived();
      },
      recalculate(refull?: boolean) {
        return vxeTable.value!.recalculate(refull);
      }
    };

    context.expose(tableInstance);

    useProviderOioTableInstance(tableInstance);

    return {
      vxeTable,

      size,

      onEvents,
      onSortChange,
      onCheckedChange,
      onCheckedAllChange,
      onRadioChange,
      onEditActived,
      onEditClosed
    };
  },
  render() {
    const {
      $attrs,
      $slots,

      size,
      resizable,
      height,
      border,
      stripe,
      rowClassName,
      cellClassName,
      headerRowClassName,
      headerCellClassName,
      footerRowClassName,
      footerCellClassName,

      loading,
      loadingIndicator,
      wrapperClassName,

      data,
      showOverflow,
      showHeaderOverflow,
      showFooterOverflow,
      rowConfig,
      columnConfig,
      sortConfig,
      radioConfig,
      checkboxConfig,
      tooltipConfig,
      expandConfig,
      editConfig,
      scrollX,
      scrollY,

      componentData,

      onEvents,
      onSortChange,
      onCheckedChange,
      onCheckedAllChange,
      onRadioChange,
      onEditActived,
      onEditClosed
    } = this;
    const {
      default: defaultSlot,
      header: headerSlot,
      footer: footerSlot
    } = PropRecordHelper.collectionSlots($slots, [
      { origin: 'default', isNotNull: true },
      { origin: 'header' },
      { origin: 'footer' }
    ]);
    const children: VNode[] = [];
    if (headerSlot) {
      children.push(createVNode('div', { class: `${DEFAULT_PREFIX}-table-header` }, headerSlot()));
    }
    children.push(
      createVNode('div', { class: `${DEFAULT_PREFIX}-table-content-wrapper` }, [
        createVNode('div', { class: `${DEFAULT_PREFIX}-table-content` }, [
          createVNode(
            VxeTable,
            {
              autoResize: true,
              ...(componentData || {}),

              ref: 'vxeTable',
              size,
              resizable,
              height,
              border: true,
              stripe: true,
              round: true,
              rowClassName,
              cellClassName,
              headerRowClassName,
              headerCellClassName,
              footerRowClassName,
              footerCellClassName,

              data,
              showOverflow,
              showHeaderOverflow,
              showFooterOverflow,
              rowConfig,
              columnConfig,
              sortConfig,
              radioConfig,
              checkboxConfig,
              tooltipConfig,
              expandConfig,
              // 移动端暂不实现行内编辑
              // editConfig,
              scrollX,
              scrollY,

              ...onEvents,
              onSortChange,
              onCheckboxChange: onCheckedChange,
              onCheckboxAll: onCheckedAllChange,
              onRadioChange,
              onEditActived,
              onEditClosed
            },
            {
              default: defaultSlot,
              empty: () => {
                return [createVNode(OioEmptyData)];
              }
            }
          )
        ])
      ])
    );
    if (footerSlot) {
      children.push(createVNode('div', { class: `${DEFAULT_PREFIX}-table-footer` }, footerSlot()));
    }
    const table = createVNode(
      'div',
      PropRecordHelper.collectionBasicProps($attrs, [`${DEFAULT_PREFIX}-table`]),
      children
    );
    if (isNil(loading)) {
      return table;
    }
    return createVNode(
      OioSpin,
      {
        class: 'default-table-view-spin',
        loading,
        loadingIndicator,
        wrapperClassName: StringHelper.append([`${DEFAULT_PREFIX}-table-wrapper`], wrapperClassName)
      },
      {
        default: () => [table]
      }
    );
  }
});
</script>
