<script lang="ts">
import { StringHelper } from '@kunlun/shared';
import { OioEmptyData, OioSpin, PropRecordHelper } from '@kunlun/vue-ui-antd';
import { isNil } from 'lodash-es';
import { computed, createVNode, defineComponent, ref, VNode } from 'vue';
import { Column as VxeColumn, Table as VxeTable, VxeTableDefines, VxeTableInstance } from 'vxe-table';
import { DEFAULT_PREFIX } from '../../../theme';
import { VxeTableHelper } from '../../../utils';
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
  onCurrentChange: 'current-change',
  onResizableChange: 'resizable-change'
};

interface OriginSort {
  field: string;
  order: 'asc' | 'desc';
  column: VxeTableDefines.ColumnInfo;
  sortTime: number;
}

interface VxeTableSortEvent {
  field: string;
  order: 'asc' | 'desc' | null;
  property: string;
  column: VxeTableDefines.ColumnInfo;
  sortList: OriginSort[];
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
  slots: ['default', 'header', 'footer'],
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
      const { field, sortList, column } = e;
      let { order } = e;
      const sorts = sortList.map((sort) => ({
        origin: sort,
        field: sort.field,
        direction: sort.order!,
        sortTime: sort.sortTime
      }));
      if (!order) {
        const sortConf = sortList?.find((a) => a.field === field);
        if (sortConf) {
          column.order = sortConf.order;
          order = sortConf.order;
        }
      }
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
      context.emit(eventKey, event);
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
      updateFooter() {
        return vxeTable.value!.updateFooter();
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
          key: VxeTableHelper.getKey(row),
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
      },
      allRowExpand(): Promise<any> {
        return vxeTable.value!.setAllRowExpand(true);
      },
      clearAllRowExpand(): Promise<any> {
        return vxeTable.value!.clearRowExpand();
      },
      setRowExpand(row, isExpand: boolean): Promise<any> {
        return vxeTable.value!.setRowExpand(row, isExpand);
      },
      sort(sortConfs: VxeTableDefines.SortConfs[]): Promise<any> {
        return vxeTable.value!.sort(sortConfs);
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
      rowStyle,
      headerRowStyle,
      cellStyle,
      headerCellStyle,

      loading,
      loadingIndicator,
      wrapperClassName,

      emptyImage,
      emptyText,

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
      treeConfig,
      customConfig,
      scrollX,
      scrollY,
      showFooter,
      footerMethod,
      spanMethod,
      mergeCells,

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
              autoResize: false,
              ...(componentData || {}),

              ref: 'vxeTable',
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
              rowStyle,
              headerRowStyle,
              cellStyle,
              headerCellStyle,

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
              treeConfig,
              customConfig,
              scrollX,
              scrollY,
              showFooter,
              footerMethod,
              spanMethod,
              mergeCells,

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
                return [
                  createVNode(OioEmptyData, {
                    description: emptyText,
                    image: emptyImage
                  })
                ];
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
