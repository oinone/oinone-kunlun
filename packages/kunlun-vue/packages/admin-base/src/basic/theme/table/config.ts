/**
 * 表格主题配置
 */
export interface TableThemeConfig {
  /**
   * 是否带有边框 default（默认）, full（完整边框）, outer（外边框）, inner（内边框）, none（无边框）
   */
  border: boolean | string;
  /**
   * 是否带有斑马纹
   */
  stripe: boolean;
  /**
   * 当鼠标点击行时，是否要高亮当前行
   */
  isCurrent: boolean;
  /**
   * 当鼠标移到行时，是否要高亮当前行
   */
  isHover: boolean;

  /**
   * 表格列主题配置
   */
  column: Partial<TableColumnThemeConfig>;
}

/**
 * 表格列主题配置
 */
export interface TableColumnThemeConfig {
  /**
   * <h3>最小宽度</h3>
   * <ul>
   *   <li>boolean: enabled column width auto compute</li>
   *   <li>number: using css width (default: px)</li>
   *   <li>string: using css width</li>
   *   <li>
   *     object: auto compute width for label by default function
   *     <ul>
   *       <li>min: min min width (default: 120)</li>
   *       <li>max: max min width (default: 432)</li>
   *       <li>chineseWidth: chinese width (default: 14 -> fontSize: 14px)</li>
   *       <li>otherWidth: non chinese width (default: 9 -> fontSize: 14px)</li>
   *       <li>sortableFixWidth: sortable handle width (default: 40)</li>
   *       <li>nonSortableFixWidth: non sortable fix width (default: 22)</li>
   *     </ul>
   *   </li>
   *   <li>function: auto compute width for label by function</li>
   * </ul>
   */
  minWidth: boolean | number | string | Partial<TableColumnMinWidthComputeConfig> | TableColumnMinWidthComputeFunction;

  /**
   * 操作列
   */
  operation: {
    /**
     * 宽度 (default: 165)
     */
    width?: number | string;
    /**
     * 最小宽度 (default: 120)
     */
    minWidth?: number | string;
  };
}

export interface TableColumnMinWidthComputeConfig {
  min: number;
  max: number;
  chineseWidth: number;
  otherWidth: number;
  sortableFixWidth: number;
  nonSortableFixWidth: number;
}

export type TableColumnMinWidthComputeConfigContext = TableColumnMinWidthComputeConfig & {
  sortable: boolean;
};

export type TableColumnMinWidthComputeFunction = (
  label: string,
  config: TableColumnMinWidthComputeConfigContext
) => number;
