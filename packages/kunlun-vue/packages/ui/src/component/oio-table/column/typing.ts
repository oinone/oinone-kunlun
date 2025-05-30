export enum ColumnFixedType {
  left = 'left',
  right = 'right'
}

export enum ColumnAlignType {
  left = 'left',
  center = 'center',
  right = 'right'
}

export interface RenderRowContext {
  rowid: string;
  row: Record<string, unknown>;
  rowIndex: number;
}
