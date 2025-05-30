/**
 * 表格尺寸
 */
export enum TableSize {
  large = 'large',
  middle = 'middle',
  small = 'small'
}

/**
 * 表格边框
 */
export enum TableBorder {
  default = 'default',
  full = 'full',
  outer = 'outer',
  inner = 'inner',
  none = 'none'
}

export enum TableOverflow {
  'ellipsis' = 'ellipsis',
  'title' = 'title',
  'tooltip' = 'tooltip'
}

/**
 * 表格选中触发方式
 */
export enum TableSelectTrigger {
  cell = 'cell',
  row = 'row'
}

/**
 * 表格编辑模式触发方式
 */
export enum TableEditorTrigger {
  /**
   * 手动触发
   */
  manual = 'manual',
  /**
   * 点击触发
   */
  click = 'click',
  /**
   * 双击触发
   */
  dblclick = 'dblclick'
}

/**
 * 表格编辑模式
 */
export enum TableEditorMode {
  /**
   * 行编辑
   */
  row = 'row',
  /**
   * 列编辑
   */
  column = 'column',
  /**
   * 单元格编辑
   */
  cell = 'cell'
}

/**
 * 表格编辑模式关闭触发
 */
export enum TableEditorCloseTrigger {
  /**
   * 手动触发
   */
  manual = 'manual',
  /**
   * 自动关闭
   */
  auto = 'auto'
}
