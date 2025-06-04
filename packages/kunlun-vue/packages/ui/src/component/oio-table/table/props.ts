import { OioComponentData, OioSpinProps } from '@oinone/kunlun-vue-ui-common';
import { PropType } from 'vue';
import { VxeTablePropTypes } from 'vxe-table';
import { TableBorder, TableOverflow, TableSize } from './typing';

export const OioTableAppearanceProps = {
  size: {
    type: String as PropType<keyof typeof TableSize>
  },
  resizable: {
    type: Boolean,
    default: undefined
  },
  height: {
    type: [String, Number]
  },
  border: {
    type: [Boolean, String] as PropType<boolean | keyof typeof TableBorder>,
    default: undefined
  },
  stripe: {
    type: Boolean,
    default: undefined
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
  customConfig: {
    type: Object as PropType<Record<string, any>>
  }
};

export const OioTableControlProps = {
  ...OioSpinProps,
  data: {
    type: Array as PropType<Record<string, unknown>[]>
  },
  showOverflow: {
    type: [Boolean, String] as PropType<boolean | keyof typeof TableOverflow>,
    default: undefined
  },
  showHeaderOverflow: {
    type: [Boolean, String] as PropType<boolean | keyof typeof TableOverflow>,
    default: undefined
  },
  showFooterOverflow: {
    type: [Boolean, String] as PropType<boolean | keyof typeof TableOverflow>,
    default: undefined
  },

  emptyText: {
    type: String,
    default: ''
  },

  emptyImage: {
    type: String,
    default: undefined
  },
  /**
   * 行配置
   */
  rowConfig: {
    type: Object as PropType<VxeTablePropTypes.RowConfig>
  },
  /**
   * 列配置
   */
  columnConfig: {
    type: Object as PropType<VxeTablePropTypes.ColumnConfig>
  },
  /**
   * 排序配置
   */
  sortConfig: {
    type: Object as PropType<VxeTablePropTypes.SortConfig>
  },
  /**
   * 单选框配置
   */
  radioConfig: {
    type: Object as PropType<VxeTablePropTypes.SortConfig>
  },
  /**
   * 复选框配置
   */
  checkboxConfig: {
    type: Object as PropType<VxeTablePropTypes.CheckboxConfig>
  },
  /**
   * tooltip 配置
   */
  tooltipConfig: {
    type: Object as PropType<VxeTablePropTypes.TooltipConfig>
  },
  /**
   * 展开行配置
   */
  expandConfig: {
    type: Object as PropType<VxeTablePropTypes.ExpandConfig>
  },
  /**
   * 可编辑配置
   */
  editConfig: {
    type: Object as PropType<VxeTablePropTypes.EditConfig>
  },
  /**
   * 树形表格配置
   */
  treeConfig: {
    type: Object as PropType<VxeTablePropTypes.TreeConfig>
  },
  /**
   * 横向虚拟滚动配置
   */
  scrollX: {
    type: Object as PropType<VxeTablePropTypes.ScrollX>
  },
  /**
   * 纵向虚拟滚动配置
   */
  scrollY: {
    type: Object as PropType<VxeTablePropTypes.ScrollY>
  },
  showFooter: {
    type: Boolean,
    default: undefined
  },
  footerMethod: {
    type: Function as PropType<VxeTablePropTypes.FooterMethod>
  },
  spanMethod: {
    type: Function as PropType<VxeTablePropTypes.SpanMethod>
  },

  mergeCells: {
    type: Array as PropType<VxeTablePropTypes.MergeCells>
  }
};

export const OioTableProps = {
  ...OioTableAppearanceProps,
  ...OioTableControlProps,
  ...OioComponentData
};
