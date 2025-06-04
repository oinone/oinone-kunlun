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
  }
};

export const OioTableProps = {
  ...OioTableAppearanceProps,
  ...OioTableControlProps,
  ...OioComponentData
};
