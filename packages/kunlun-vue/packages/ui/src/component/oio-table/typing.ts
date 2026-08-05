import type { VNode } from 'vue';
import { VxeTableDefines, VxeTableInstance } from 'vxe-table';
import { TableEditorCloseTrigger, TableEditorMode } from './table';

/**
 * 行上下文
 */
export interface RowContext<T = unknown> {
  /**
   * 当前唯一键, 默认使用__draftId, 若不存在时，使用第三方组件内置唯一键（如VxeTable使用{@link VXE_TABLE_X_ID}）
   */
  key: string;
  /**
   * 当前行数据
   */
  data: Record<string, unknown>;
  /**
   * 当前行索引
   */
  index: number;
  /**
   * 第三方组件原始上下文
   */
  origin: T;
}

interface BaseContext<T = unknown> {
  /**
   * 当前行数据
   */
  row: Record<string, unknown>;
  /**
   * 行索引
   */
  rowIndex: number;
  /**
   * 列索引
   */
  columnIndex: number;
  /**
   * 第三方组件原始上下文
   */
  origin: T;
}

/**
 * 行内编辑上下文
 */
export interface ActiveEditorContext<T = unknown> extends BaseContext<T> {
  /**
   * 预处理的行内编辑上下文
   */
  prepare?: boolean;
  /**
   * 新行
   */
  new?: boolean;
  /**
   * 新行编辑完成后插入位置索引
   */
  insertTo?: number;
  /**
   * 当前列
   */
  column: {
    field: string | undefined;
  };
  /**
   * 列可编辑过滤
   */
  editableMap: Record<string, boolean>;
  /**
   * 数据提交
   */
  submit: boolean;
  /**
   * 行内编辑模式; 一般用于开启行内编辑时手动指定编辑模式，强制覆盖当前配置的编辑模式;
   */
  editorMode?: TableEditorMode;
  /**
   * 行内编辑关闭触发方式; 一般用于开启行内编辑时手动指定关闭触发方式，强制覆盖当前配置的关闭触发方式;
   */
  editorCloseTrigger?: TableEditorCloseTrigger;
  /**
   * 强制编辑
   */
  forceEditable?: boolean;
  /**
   * @see RuntimeAction
   */
  triggerAction?: Record<string, unknown>;
}

export type RenderCellContext<T = unknown> = BaseContext<T>;

export type CellRenderFunction<T = unknown> = (context: RowContext<T>) => VNode[] | string;

export interface OioTableInstance {
  getOrigin(): VxeTableInstance;

  setCurrentRow(row: unknown): Promise<any>;

  clearCurrentRow(): Promise<any>;

  setCheckboxRow(rows: unknown[], checked: boolean): Promise<any>;

  clearCheckboxRow(): Promise<any>;

  resetCheckboxRow(rows: unknown[]): Promise<any>;

  setRadioRow(row: unknown): Promise<any>;

  clearRadioRow(): Promise<any>;

  getAllColumns(): VxeTableDefines.ColumnInfo[];

  refreshColumn(): Promise<any>;

  loadColumns(columns: (VxeTableDefines.ColumnOptions | VxeTableDefines.ColumnInfo)[]): Promise<any>;

  reloadColumns(columns: (VxeTableDefines.ColumnOptions | VxeTableDefines.ColumnInfo)[]): Promise<any>;

  updateFooter();

  getTableData(index: number): Promise<any>;

  setEditRow(row: unknown): Promise<any>;

  isEditRow(row: unknown): boolean;

  getActiveEditorRecord(): RowContext | undefined;

  activeCellEditor(row: unknown, fieldOrColumn: string | VxeTableDefines.ColumnInfo): Promise<any>;

  clearEditor(): Promise<any>;

  recalculate(refull?: boolean): Promise<any>;

  allRowExpand(): Promise<any>;

  clearAllRowExpand(): Promise<any>;

  setRowExpand(row: unknown, isExpand: boolean): Promise<any>;

  getSortColumns(): VxeTableDefines.SortCheckedParams[];

  clearSort(fieldOrColumn: string | VxeTableDefines.ColumnInfo): Promise<any>;

  sort(sortConfs: VxeTableDefines.SortConfs[]): Promise<any>;

  insert(records: Record<string, unknown> | Record<string, unknown>[], index?: number): Promise<any>;

  isInsertByRow(row: unknown): boolean;

  removeInsertRow(): Promise<any>;
}

export type VxeTableRowContext = RowContext<VxeTableDefines.CellRenderBodyParams>;

export type VxeTableActiveEditorEventContext = ActiveEditorContext<VxeTableDefines.EditActivedEventParams>;

export type VxeTableCellRenderFunction = CellRenderFunction<VxeTableDefines.CellRenderBodyParams>;
