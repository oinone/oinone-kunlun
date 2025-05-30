import { VNode } from 'vue';
import { VxeTableDefines, VxeTableInstance } from 'vxe-table';

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

  setEditRow(row: unknown): Promise<any>;

  getActiveEditorRecord(): RowContext | undefined;

  activeCellEditor(row: unknown, fieldOrColumn: string | VxeTableDefines.ColumnInfo): Promise<any>;

  clearEditor(): Promise<any>;

  recalculate(refull?: boolean): Promise<any>;
}

export type VxeTableRowContext = RowContext<VxeTableDefines.CellRenderBodyParams>;

export type VxeTableActiveEditorEventContext = ActiveEditorContext<VxeTableDefines.EditActivedEventParams>;

export type VxeTableCellRenderFunction = CellRenderFunction<VxeTableDefines.CellRenderBodyParams>;
