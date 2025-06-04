<script lang="ts">
import { DslDefinition } from '@oinone/kunlun-dsl';
import { ActiveRecord, ActiveRecords, Pagination, translateValueByKey } from '@oinone/kunlun-engine';
import { EDirection, ISort } from '@oinone/kunlun-service';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { DEFAULT_PREFIX, THEME_CONFIG } from '@oinone/kunlun-theme';
import {
  ActiveEditorContext,
  CheckedChangeEvent,
  OioColumn,
  OioTable,
  OioTableInstance,
  RadioChangeEvent,
  RowContext,
  SortChangeEvent,
  TableEditorCloseTrigger,
  TableEditorMode,
  TableEditorTrigger,
  TableSelectTrigger,
  TableSize,
  VXE_TABLE_X_ID,
  VxeTableActiveEditorEventContext
} from '../../ui';
import { ListSelectMode, OioPagination, OioSpin, StyleHelper } from '@oinone/kunlun-vue-ui-mobile-vant';
import { DslRender } from '@oinone/kunlun-vue-widget';
import { ListPaginationStyle } from '@oinone/kunlun-vue-ui-mobile-vant';
import { computed, createVNode, defineComponent, nextTick, onMounted, PropType, ref, Slot, VNode, watch } from 'vue';
import { VxeTableDefines } from 'vxe-table';
import { ManualWidget } from '../../basic';
import { UserTablePrefer } from '../../typing';
import { TableRowClickMode } from './typing';
import { Icon as VanIcon } from 'vant';
import { DEFAULT_VIEW_CLASS } from '../../ui/theme';

const SortDirections = {
  desc: EDirection.DESC,
  asc: EDirection.ASC
};

function sortColumnsByUserPrefer(
  columns: VxeTableDefines.ColumnInfo[],
  userPrefer: UserTablePrefer
): VxeTableDefines.ColumnInfo[] {
  const { fieldOrder } = userPrefer;
  if (fieldOrder.length) {
    /**
     * 为了性能考虑, 此处的分类方式将假设字段全部在中间
     */
    const leftColumns: VxeTableDefines.ColumnInfo[] = [];
    const fieldColumns: { field: string; orderIndex: number; column: VxeTableDefines.ColumnInfo }[] = [];
    const rightColumns: VxeTableDefines.ColumnInfo[] = [];
    let isHandleFieldColumn = false;
    for (const column of columns) {
      const { field } = column;
      if (field) {
        isHandleFieldColumn = true;
        fieldColumns.push({
          field,
          orderIndex: fieldOrder.findIndex((v) => v === field),
          column
        });
      } else if (isHandleFieldColumn) {
        rightColumns.push(column);
      } else {
        leftColumns.push(column);
      }
    }
    return [
      ...leftColumns,
      ...fieldColumns
        .sort((a, b) => {
          if (a.orderIndex === -1) {
            return 1;
          }
          if (b.orderIndex === -1) {
            return -1;
          }
          return a.orderIndex - b.orderIndex;
        })
        .map((v) => v.column),
      ...rightColumns
    ];
  }
  return columns;
}

export default defineComponent({
  name: 'DefaultTable',
  mixins: [ManualWidget],
  components: {
    OioTable,
    OioColumn,
    OioSpin,
    OioPagination
  },
  inheritAttrs: false,
  props: {
    setTableInstance: {
      type: Function as PropType<(tableInstance: OioTableInstance | undefined) => void>
    },
    loading: {
      type: Boolean,
      default: undefined
    },
    template: {
      type: Object as PropType<DslDefinition>
    },
    dataSource: {
      type: Array as PropType<ActiveRecord[]>
    },
    showDataSource: {
      type: Array as PropType<ActiveRecord[]>
    },
    height: {
      type: String
    },
    minHeight: {
      type: String
    },
    maxHeight: {
      type: String
    },
    pagination: {
      type: Object as PropType<Pagination>
    },
    showPagination: {
      type: Boolean,
      default: undefined
    },
    onPaginationChange: {
      type: Function as PropType<(currentPage: number, pageSize: number) => ReturnPromise<void>>
    },
    selectMode: {
      type: String as PropType<ListSelectMode>
    },
    onCheckedChange: {
      type: Function as PropType<(data: ActiveRecords) => void>
    },
    onCheckedAllChange: {
      type: Function as PropType<(selected: boolean, data: ActiveRecord[]) => void>
    },
    onRadioChange: {
      type: Function as PropType<(data: ActiveRecord) => void>
    },
    onSortChange: {
      type: Function as PropType<(sorts: ISort[]) => void>
    },
    editorTrigger: {
      type: String as PropType<TableEditorTrigger>
    },
    editorMode: {
      type: String as PropType<TableEditorMode>
    },
    editorCloseTrigger: {
      type: String as PropType<TableEditorCloseTrigger>
    },
    editorShowIcon: {
      type: Boolean,
      default: undefined
    },
    activeEditorBefore: {
      type: Function as PropType<(context: ActiveEditorContext) => boolean>
    },
    activeEditor: {
      type: Function as PropType<(context: ActiveEditorContext) => ReturnPromise<void>>
    },
    rowEditorClosed: {
      type: Function as PropType<(context: RowContext) => Promise<boolean>>
    },
    allowRowClick: {
      type: Boolean,
      default: undefined
    },
    rowClickMode: {
      type: Array as PropType<TableRowClickMode[]>
    },
    onCurrentChange: {
      type: Function
    },
    onRowClick: {
      type: Function
    },
    onRowDblClick: {
      type: Function
    },
    expandAccordion: {
      type: Boolean,
      default: undefined
    },
    existExpandRow: {
      type: Boolean,
      default: undefined
    },
    onToggleRowExpand: {
      type: Function,
      default: () => () => {}
    },
    onResizableChange: {
      type: Function
    },
    userPrefer: {
      type: Object as PropType<UserTablePrefer>
    },
    lineHeight: {
      type: Number,
      required: false
    },
    inline: {
      type: Boolean,
      required: true
    },
    /**
     * 推荐使用<element widget="checkboxColumn" />标签
     * @deprecated 5.0
     */
    checkbox: {
      type: Boolean,
      default: undefined
    },
    /**
     * 推荐使用<element widget="sequenceColumn" />标签
     * @deprecated 5.0
     */
    enableSequence: {
      type: Boolean,
      default: undefined
    },
    onScroll: {
      type: Function,
      required: true
    },
    paginationStyle: {
      type: String as PropType<ListPaginationStyle>
    }
  },
  setup(props) {
    const table = ref<OioTableInstance | undefined>();

    const pagination = computed(() => {
      return props.pagination || {};
    });

    const editorMode = computed(() => {
      const value = props.editorMode;
      if (value === TableEditorMode.column) {
        return TableEditorMode.cell;
      }
      return value;
    });

    const autoCloseEditor = computed(() => {
      return props.editorCloseTrigger === TableEditorCloseTrigger.auto;
    });

    const editorClosed = (event: VxeTableActiveEditorEventContext) => {
      let fn: ((rowContext: RowContext) => void) | undefined;
      if (props.editorMode === TableEditorMode.row) {
        fn = props.rowEditorClosed;
      }
      if (fn) {
        const data = event.row as ActiveRecord;
        return fn({
          key: data.__draftId || (data[VXE_TABLE_X_ID] as string),
          data,
          index: event.rowIndex,
          origin: event
        });
      }
    };

    const onPaginationChange = (currentPage: number, pageSize: number) => {
      props.onPaginationChange?.(currentPage, pageSize);
      nextTick(() => {
        table.value?.refreshColumn();
      });
    };

    const onSortChange = (event: SortChangeEvent) => {
      const { field, direction } = event;
      if (direction === false) {
        props.onSortChange?.([]);
      } else {
        props.onSortChange?.([
          {
            sortField: field,
            direction: SortDirections[direction]
          }
        ]);
      }
      nextTick(() => {
        table.value?.refreshColumn();
      });
    };

    const onCheckedChange = (event: CheckedChangeEvent) => {
      const { records } = event;
      props.onCheckedChange?.(records);
    };

    const onCheckedAllChange = (event: CheckedChangeEvent) => {
      const { checked, records } = event;
      props.onCheckedAllChange?.(checked, records);
    };

    const onRadioChange = (event: RadioChangeEvent) => {
      const { newRecord } = event;
      props.onRadioChange?.(newRecord);
    };

    const style = computed(() => {
      return StyleHelper.parse(props.template?.style);
    });

    const onToggleRowExpand = (...args) => {
      props.onToggleRowExpand?.(...args);
      nextTick(() => {
        table.value?.refreshColumn();
      });
    };

    onMounted(() => {
      props.setTableInstance?.(table.value);
    });

    watch(
      () => props.userPrefer,
      (val) => {
        if (!val) {
          return;
        }
        nextTick(() => {
          const tableRef = table.value;
          if (!tableRef) {
            return;
          }
          let columns = tableRef.getAllColumns();
          columns = sortColumnsByUserPrefer(columns, val);
          tableRef.reloadColumns(columns);
        });
      },
      { immediate: true }
    );

    return {
      table,
      style,

      pagination,
      editorMode,
      autoCloseEditor,
      editorClosed,
      onPaginationChange,
      onSortChange,
      onCheckedChange,
      onCheckedAllChange,
      onRadioChange,
      onToggleRowExpand
    };
  },
  render() {
    const {
      showDataSource,
      height,
      minHeight,
      maxHeight,

      enableSequence,

      selectMode,
      inline,
      checkbox,
      onCurrentChange,
      onCheckedChange,
      onCheckedAllChange,
      onRadioChange,

      onSortChange,

      showPagination,
      pagination,
      onPaginationChange,

      allowRowClick,
      rowClickMode,
      onRowClick,
      onRowDblClick,

      expandAccordion,
      existExpandRow,
      onToggleRowExpand,

      editorTrigger,
      editorMode,
      autoCloseEditor,
      editorShowIcon,
      activeEditorBefore,
      activeEditor,
      editorClosed,
      onScroll
    } = this;
    let { border = false, stripe = false, isCurrent = true, isHover = true } = THEME_CONFIG['table-config'] || {};
    const VEX_TABLE_BORDER_MODE = [true, false, 'default', 'outer', 'full', 'inner'];
    let tableCustomClass = '';
    if (!VEX_TABLE_BORDER_MODE.includes(border)) {
      tableCustomClass = border as string;
      border = 'inner';
    }
    const tableSlots: Record<string, Slot> = {
      default: () => {
        const children: VNode[] = [];
        children.push(
          createVNode(OioColumn, {
            type: 'checkbox',
            className: 'table-column-checkbox',
            headerClassName: 'table-header-column-checkbox',
            width: 52,
            align: 'center',
            // 解决开启序列后复选框无法正常显示的问题
            invisible: checkbox === false,
            fixed: existExpandRow ? undefined : 'left'
          })
        );
        if (enableSequence) {
          children.push(
            createVNode(OioColumn, {
              type: 'seq',
              width: 60,
              label: translateValueByKey('序号'),
              align: 'center',
              fixed: existExpandRow ? undefined : 'left'
            })
          );
        }
        const columns = this.$slots?.default?.() || [];
        return [...children, ...columns];
      }
    };
    if (showPagination) {
      tableSlots.footer = () => {
        if (this.paginationStyle === ListPaginationStyle.SCROLL) {
          return [
            createVNode(
              'div',
              { class: [`${DEFAULT_PREFIX}-pagination-total`] },
              `${pagination.total || 0}${this.$translate('条')}`
            )
          ];
        }

        return [
          createVNode(
            OioPagination,
            {
              currentPage: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showTotal: true,
              showJumper: true,
              onChange: onPaginationChange,
              onShowSizeChange: onPaginationChange
            },
            {
              'prev-text': () => createVNode(VanIcon, { name: 'arrow-left' }),
              'next-text': () => createVNode(VanIcon, { name: 'arrow' })
            }
          )
        ];
      };
    }
    const tableProps: Record<string, unknown> = {
      ref: 'table',
      loading: this.loading,
      size: TableSize.small,
      class: tableCustomClass,
      stripe,
      showOverflow: false,
      showHeaderOverflow: false,
      border,
      resizable: false,
      data: showDataSource,
      scrollX: { gt: -1 },
      scrollY: { gt: -1 },
      tooltipConfig: { enterable: true },
      height: 'auto',
      rowConfig: { isCurrent, isHover },
      columnConfig: { useKey: true },
      sortConfig: { remote: true },
      expandConfig: { accordion: expandAccordion },
      editConfig: {
        trigger: editorTrigger,
        mode: editorMode,
        autoClear: autoCloseEditor,
        beforeEditMethod: activeEditorBefore,
        showIcon: editorShowIcon
      },
      onCurrentChange,
      onSortChange,
      onScroll,
      onEditActived: activeEditor,
      onEditClosed: editorClosed,
      onToggleRowExpand
    };

    const mode = inline ? ListSelectMode.checkbox : selectMode;
    if (mode) {
      const selectTrigger = allowRowClick ? TableSelectTrigger.cell : TableSelectTrigger.row;
      switch (mode) {
        case ListSelectMode.checkbox:
          tableProps.checkboxConfig = { trigger: selectTrigger, highlight: true };
          tableProps.onCheckedChange = onCheckedChange;
          tableProps.onCheckedAllChange = onCheckedAllChange;
          break;
        case ListSelectMode.radio:
          tableProps.radioConfig = { trigger: selectTrigger, highlight: true };
          tableProps.onRadioChange = onRadioChange;
          break;
      }
    }
    if (allowRowClick) {
      if (rowClickMode) {
        if (rowClickMode.includes(TableRowClickMode.click)) {
          tableProps.onCellClick = onRowClick;
        }
        if (rowClickMode.includes(TableRowClickMode.dblclick)) {
          tableProps.onCellDblclick = onRowDblClick;
        }
      } else {
        tableProps.onCellDblclick = onRowDblClick;
      }
    }
    const containerChildren: VNode[] = [createVNode(OioTable, tableProps, tableSlots)];
    const clickSlot = DslRender.fetchVNodeSlots(this.template, ['click'])?.click;
    if (clickSlot && allowRowClick && (onRowClick || onRowDblClick)) {
      containerChildren.push(createVNode('div', { class: 'table-container-click' }, clickSlot()));
    }
    return createVNode(
      'div',
      {
        class: `default-mobile-table ${DEFAULT_VIEW_CLASS}`,
        style: {
          height,
          minHeight,
          maxHeight
        }
      },
      containerChildren
    );
  }
});
</script>
