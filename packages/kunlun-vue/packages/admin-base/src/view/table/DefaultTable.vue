<script lang="ts">
import { DslDefinition } from '@oinone/kunlun-dsl';
import { ActiveRecord, ActiveRecords, Pagination, translateValueByKey } from '@oinone/kunlun-engine';
import { EDirection, ISort } from '@oinone/kunlun-service';
import { ReturnPromise } from '@oinone/kunlun-shared';
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
  VxeTableActiveEditorEventContext,
  VxeTableHelper
} from '@oinone/kunlun-vue-ui';
import { ListPaginationStyle, ListSelectMode, OioPagination, OioSpin, StyleHelper } from '@oinone/kunlun-vue-ui-antd';
import { DslRender } from '@oinone/kunlun-vue-widget';
import { debounce } from 'lodash-es';
import {
  computed,
  createVNode,
  defineComponent,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  Slot,
  VNode,
  watch
} from 'vue';
import { VxeTableDefines, VxeTablePropTypes } from 'vxe-table';
import { getTableThemeConfig, ManualWidget } from '../../basic';
import { UserTablePrefer } from '../../typing';
import { TableRowClickMode } from './typing';

const SortDirections = {
  desc: EDirection.DESC,
  asc: EDirection.ASC
};

function sortColumnsByUserPrefer(
  columns: VxeTableDefines.ColumnInfo[],
  fieldOrder: string[]
): VxeTableDefines.ColumnInfo[] {
  if (fieldOrder && fieldOrder.length) {
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
        let orderIndex = fieldOrder.findIndex((v) => v === field);
        if (orderIndex === -1) {
          orderIndex = fieldColumns[fieldColumns.length - 1]?.orderIndex;
          if (orderIndex == null) {
            orderIndex = 0;
          }
        }
        fieldColumns.push({
          field,
          orderIndex,
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
    rowClassName: {
      type: [String, Function] as PropType<VxeTablePropTypes.RowClassName>
    },
    cellClassName: {
      type: [String, Function] as PropType<VxeTablePropTypes.CellClassName>
    },
    headerRowClassName: {
      type: [String, Function] as PropType<VxeTablePropTypes.HeaderRowClassName>
    },
    headerCellClassName: {
      type: [String, Function] as PropType<VxeTablePropTypes.HeaderCellClassName>
    },
    footerRowClassName: {
      type: [String, Function] as PropType<VxeTablePropTypes.FooterRowClassName>
    },
    footerCellClassName: {
      type: [String, Function] as PropType<VxeTablePropTypes.FooterCellClassName>
    },
    /**
     * 给行附加样式，也可以是函数
     */
    rowStyle: {
      type: [Object, Function] as PropType<VxeTablePropTypes.RowStyle>
    },
    /**
     * 给表头行附加样式
     */
    headerRowStyle: {
      type: [Object, Function] as PropType<VxeTablePropTypes.HeaderRowStyle>
    },
    /**
     * 给单元格附加样式
     */
    cellStyle: {
      type: [Object, Function] as PropType<VxeTablePropTypes.CellStyle>
    },
    /**
     * 给表头单元格附加样式
     */
    headerCellStyle: {
      type: [Object, Function] as PropType<VxeTablePropTypes.HeaderCellStyle>
    },
    pagination: {
      type: Object as PropType<Pagination>
    },
    showPagination: {
      type: Boolean,
      default: undefined
    },
    paginationStyle: {
      type: String as PropType<ListPaginationStyle>
    },
    onPaginationChange: {
      type: Function as PropType<(currentPage: number, pageSize: number) => ReturnPromise<void>>
    },
    selectMode: {
      type: String as PropType<ListSelectMode>
    },
    checkMethod: {
      type: Function
    },
    onCheckedChange: {
      type: Function as PropType<(data: ActiveRecords, event?: CheckedChangeEvent) => void>
    },
    onCheckedAllChange: {
      type: Function as PropType<(selected: boolean, data: ActiveRecord[], event?: CheckedChangeEvent) => void>
    },
    onRadioChange: {
      type: Function as PropType<(data: ActiveRecord, event?: RadioChangeEvent) => void>
    },
    sortConfig: {
      type: Object as PropType<VxeTablePropTypes.SortConfig>
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
    expandAll: {
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
      type: Object as PropType<UserTablePrefer>,
      default: () => ({})
    },
    usingSimpleUserPrefer: {
      type: Boolean,
      default: undefined
    },
    lineHeight: {
      type: Number
    },
    minLineHeight: {
      type: Number
    },
    showFooter: {
      type: Boolean,
      default: undefined
    },
    footerMethod: {
      type: Function
    },
    spanMethod: {
      type: Function
    },
    mergeCells: {
      type: Array as PropType<VxeTablePropTypes.MergeCells>
    },
    scrollX: {
      type: Object
    },
    scrollY: {
      type: Object
    },
    emptyText: {
      type: String,
      default: ''
    },
    emptyImage: {
      type: String,
      default: undefined
    },
    pageSizeOptions: {
      type: Array as PropType<(number | string)[]>
    },
    treeConfig: {
      type: Object as PropType<VxeTablePropTypes.TreeConfig>
    },
    autoLineHeight: {
      type: Boolean,
      default: false
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
    }
  },
  setup(props) {
    const defaultTableRef = ref<HTMLElement>(null as any);
    const table = ref<OioTableInstance | undefined>();

    const tableContentElement = computed(
      () => defaultTableRef.value && defaultTableRef.value.querySelector('.oio-table-content-wrapper')!
    );

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
      if ([TableEditorMode.row, TableEditorMode.cell].includes(props.editorMode!)) {
        fn = props.rowEditorClosed;
      }
      if (fn) {
        const data = event.row as ActiveRecord;
        return fn({
          key: VxeTableHelper.getKey(data),
          data,
          index: event.rowIndex,
          origin: event
        });
      }
    };

    const onPaginationChange = (currentPage: number, pageSize: number) => {
      props.onPaginationChange?.(currentPage, pageSize);
      // nextTick(() => {
      //   table.value?.refreshColumn();
      // });
    };

    const onResizableChange = (...args) => {
      props.onResizableChange?.(...args);

      nextTick(calcTableColumnHeight);
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
      // nextTick(() => {
      //   table.value?.refreshColumn();
      // });
    };

    const onCheckedChange = (event: CheckedChangeEvent) => {
      const { records } = event;
      props.onCheckedChange?.(records, event);
    };

    const onCheckedAllChange = (event: CheckedChangeEvent) => {
      const { checked, records } = event;
      props.onCheckedAllChange?.(checked, records, event);
    };

    const onRadioChange = (event: RadioChangeEvent) => {
      const { newRecord } = event;
      props.onRadioChange?.(newRecord, event);
    };

    const style = computed(() => {
      return StyleHelper.parse(props.template?.style);
    });

    const calcHeight = ref('');

    const tableLineHeight = computed(() => {
      if (props.lineHeight && props.lineHeight > 0) {
        return `${props.lineHeight}px`;
      }

      if (calcHeight.value) {
        return calcHeight.value;
      }

      return 'var(--oio-table-thead-height)';
    });

    const calcHeaderHeight = ref('');
    const tableHeaderHeight = computed(() => {
      if (calcHeaderHeight.value) {
        return calcHeaderHeight.value;
      }

      return 'var(--oio-table-thead-height)';
    });

    const onToggleRowExpand = (...args) => {
      props.onToggleRowExpand?.(...args);
      nextTick(() => {
        table.value?.refreshColumn();
      });
    };

    const calcTableColumnHeight = debounce(() => {
      if (!table.value) {
        return;
      }

      const tableEle = table.value?.getOrigin().$el;
      const defaultColumn = tableEle.querySelector(
        '.vxe-table--main-wrapper > .vxe-table--body-wrapper .vxe-body--column'
      );
      const operationColumn = tableEle.querySelector('.vxe-table--fixed-right-wrapper .operation-column');
      if (defaultColumn && operationColumn) {
        const defaultHeight = defaultColumn?.getBoundingClientRect().height!;
        const operationHeight = operationColumn?.getBoundingClientRect().height!;

        if (defaultHeight > 0 && operationHeight > 0) {
          if (operationHeight >= defaultHeight) {
            calcHeight.value = `${operationHeight}px`;
          } else if (defaultHeight) {
            calcHeight.value = `${defaultHeight}px`;
          }
        }
      }

      const headerTable = tableEle.querySelector('.vxe-table--main-wrapper > .vxe-table--header-wrapper');
      const fixedRightColumn = tableEle.querySelector(
        '.vxe-table--fixed-wrapper > .vxe-table--fixed-right-wrapper .vxe-header--column'
      );
      if (headerTable && fixedRightColumn) {
        const headerTableHeight = headerTable?.getBoundingClientRect().height!;
        const fixedRightColumnHeight = fixedRightColumn?.getBoundingClientRect().height!;
        if (headerTableHeight > 0 && fixedRightColumnHeight > 0) {
          if (headerTableHeight >= fixedRightColumnHeight) {
            calcHeaderHeight.value = `${headerTableHeight}px`;
          } else if (fixedRightColumnHeight) {
            calcHeaderHeight.value = `${fixedRightColumnHeight}px`;
          }
        }
      }

      if (!props.autoLineHeight) {
        return;
      }

      nextTick(() => {
        const rows = tableEle.querySelectorAll(
          '.vxe-table--main-wrapper .vxe-table--body .vxe-body--row'
        ) as HTMLElement[];

        const leftFixedRows = tableEle.querySelectorAll(
          '.vxe-table--fixed-wrapper .vxe-table--fixed-right-wrapper .vxe-body--row'
        ) as HTMLElement[];

        const rightFixedRows = tableEle.querySelectorAll(
          '.vxe-table--fixed-wrapper .vxe-table--fixed-left-wrapper .vxe-body--row'
        ) as HTMLElement[];

        rows.forEach((row, index) => {
          const height = row.clientHeight;

          const leftFixedRow = leftFixedRows[index];
          const rightFixedRow = rightFixedRows[index];

          const maxHeight = Math.max(
            height || 0,
            leftFixedRow?.clientHeight || 0,
            rightFixedRow?.clientHeight || 0,
            props.minLineHeight || 0
          );

          if (leftFixedRow && leftFixedRow.clientHeight !== maxHeight) {
            leftFixedRow.style.height = `${maxHeight}px`;
          }

          if (height !== maxHeight) {
            row.style.height = `${maxHeight}px`;
          }

          if (rightFixedRow && rightFixedRow.clientHeight !== maxHeight) {
            rightFixedRow.style.height = `${maxHeight}px`;
          }
        });
      });
    });

    let _height = 0;
    const resizeObserver = new ResizeObserver((entries) => {
      const target = entries.find((e) => e.target === tableContentElement.value);

      if (target) {
        const { height } = target.contentRect;
        if (_height !== height) {
          _height = height;

          table.value?.refreshColumn();
        }
      }
    });

    let isMounted = false;

    onActivated(() => {
      if (isMounted) {
        isMounted = false;
        return;
      }
      table.value?.refreshColumn();
    });

    onMounted(async () => {
      isMounted = true;

      props.setTableInstance?.(table.value);

      await nextTick();
      calcTableColumnHeight();

      window.addEventListener('resize', calcTableColumnHeight);

      resizeObserver.observe(tableContentElement.value);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', calcTableColumnHeight);
      resizeObserver.unobserve(tableContentElement.value);
    });

    const stop = watch(
      () => props.dataSource,
      (v) => {
        if (v && v.length) {
          nextTick(() => {
            calcTableColumnHeight();

            stop();
          });
        }
      },
      { immediate: true }
    );

    let preUserPrefer = JSON.stringify(props.userPrefer || {});

    watch(
      () => {
        return {
          fieldPrefer: props.userPrefer.fieldPrefer,
          fieldOrder: props.userPrefer.fieldOrder,
          fieldLeftFixed: props.userPrefer.fieldLeftFixed,
          fieldRightFixed: props.userPrefer.fieldRightFixed
        };
      },
      (value) => {
        if (!value || !value.fieldOrder) {
          return;
        }

        const currentUserPrefer = JSON.stringify(value);

        if (preUserPrefer === currentUserPrefer) {
          return;
        }

        preUserPrefer = currentUserPrefer;

        nextTick(() => {
          const tableRef = table.value;
          if (!tableRef) {
            return;
          }
          let columns = tableRef.getAllColumns();
          columns = sortColumnsByUserPrefer(
            columns.map((v) => {
              v.resizeWidth = 0;
              return v;
            }),
            value.fieldOrder
          );
          tableRef.reloadColumns(columns);
        });
      },
      { immediate: true }
    );

    return {
      defaultTableRef,
      table,
      style,
      tableLineHeight,
      tableHeaderHeight,

      pagination,
      editorMode,
      autoCloseEditor,
      onResizableChange,
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
      rowClassName,
      headerRowClassName,
      footerRowClassName,
      cellClassName,
      headerCellClassName,
      footerCellClassName,
      rowStyle,
      headerRowStyle,
      cellStyle,
      headerCellStyle,

      enableSequence,

      selectMode,
      checkbox,
      checkMethod,
      onCurrentChange,
      onCheckedChange,
      onCheckedAllChange,
      onRadioChange,

      sortConfig,
      onSortChange,

      showPagination,
      paginationStyle,
      pagination,
      onPaginationChange,

      allowRowClick,
      rowClickMode,
      onRowClick,
      onRowDblClick,

      expandAccordion,
      expandAll,
      existExpandRow,
      onToggleRowExpand,
      onResizableChange,

      editorTrigger,
      editorMode,
      autoCloseEditor,
      editorShowIcon,
      activeEditorBefore,
      activeEditor,
      editorClosed,

      treeConfig,
      scrollX,
      scrollY,

      usingSimpleUserPrefer,

      showFooter,
      footerMethod,
      spanMethod,
      mergeCells,

      emptyText,
      emptyImage,
      pageSizeOptions
    } = this;
    let { border = false, stripe = false, isCurrent = true, isHover = false } = getTableThemeConfig() || {};
    const VEX_TABLE_BORDER_MODE = [true, false, 'default', 'outer', 'full', 'inner'];
    let tableCustomClass = '';
    if (!VEX_TABLE_BORDER_MODE.includes(border)) {
      tableCustomClass = border as string;
      border = 'inner';
    }
    const tableSlots: Record<string, Slot> = {
      default: () => {
        const children: VNode[] = [];
        if (checkbox !== false) {
          children.push(
            createVNode(OioColumn, {
              type: 'checkbox',
              className: 'table-column-checkbox',
              headerClassName: 'table-header-column-checkbox',
              width: 52,
              align: 'center',
              fixed: existExpandRow ? undefined : 'left'
            })
          );
        }
        if (enableSequence) {
          children.push(
            createVNode(OioColumn, {
              type: 'seq',
              width: 58,
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
        return [
          createVNode(OioPagination, {
            pageSizeOptions,
            currentPage: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showTotal: true,
            showJumper: paginationStyle != ListPaginationStyle.SIMPLE,
            showLastPage: paginationStyle != ListPaginationStyle.SIMPLE,
            onChange: onPaginationChange
          })
        ];
      };
    }
    const tableProps: Record<string, unknown> = {
      ref: 'table',
      loading: this.loading,
      size: TableSize.small,
      class: tableCustomClass,
      stripe,
      showOverflow: true,
      showHeaderOverflow: true,
      border,
      resizable: true,
      data: showDataSource,
      scrollX,
      scrollY,
      tooltipConfig: { enterable: true },
      height: 'auto',
      rowConfig: { isCurrent, isHover },
      sortConfig,
      rowClassName,
      headerRowClassName,
      footerRowClassName,
      cellClassName,
      headerCellClassName,
      footerCellClassName,
      rowStyle,
      headerRowStyle,
      cellStyle,
      headerCellStyle,
      expandConfig: { accordion: expandAccordion, expandAll },
      editConfig: {
        trigger: editorTrigger,
        mode: editorMode,
        autoClear: autoCloseEditor,
        beforeEditMethod: activeEditorBefore,
        showIcon: editorShowIcon
      },
      treeConfig,
      emptyText,
      emptyImage,
      showFooter,
      footerMethod,
      spanMethod,
      mergeCells,
      onCurrentChange,
      onSortChange,
      onEditActived: activeEditor,
      onEditClosed: editorClosed,
      onToggleRowExpand,
      onResizableChange,
      customConfig: { usingSimpleUserPrefer }
    };
    if (selectMode) {
      const selectTrigger = allowRowClick ? TableSelectTrigger.cell : TableSelectTrigger.row;
      switch (selectMode) {
        case ListSelectMode.checkbox:
          tableProps.checkboxConfig = { trigger: selectTrigger, highlight: true, checkMethod };
          tableProps.onCheckedChange = onCheckedChange;
          tableProps.onCheckedAllChange = onCheckedAllChange;
          break;
        case ListSelectMode.radio:
          tableProps.radioConfig = { trigger: selectTrigger, highlight: true, checkMethod };
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

    if (allowRowClick) {
      const clickSlot = DslRender.fetchVNodeSlots(this.template, ['click'])?.click;
      if (clickSlot && (onRowClick || onRowDblClick)) {
        containerChildren.push(createVNode('div', { class: 'table-container-click' }, clickSlot()));
      }
    }
    return createVNode(
      'div',
      {
        class: 'default-table',
        style: {
          height,
          minHeight,
          maxHeight
        },
        ref: 'defaultTableRef'
      },
      containerChildren
    );
  }
});
</script>
<style lang="scss">
.default-table .oio-table .oio-table-content {
  > .vxe-table--render-default.size--mini .vxe-body--row .vxe-body--column.col--ellipsis,
  .vxe-table--render-default.vxe-editable.size--mini .vxe-body--column {
    height: v-bind(tableLineHeight);
  }

  > .vxe-table--render-default.size--mini .vxe-header--column.col--ellipsis {
    height: v-bind(tableHeaderHeight);
  }
}
</style>
