import { VxeTableDefines } from 'vxe-table';
import { VXE_TABLE_X_ID } from '../constant';

export class VxeTableHelper {
  public static getFlatAllColumns(columns: VxeTableDefines.ColumnInfo[]): VxeTableDefines.ColumnInfo[] {
    const finalColumns: VxeTableDefines.ColumnInfo[] = [];
    for (const column of columns) {
      const { children } = column;
      if (children) {
        finalColumns.push(...VxeTableHelper.getFlatAllColumns(children));
      } else {
        finalColumns.push(column);
      }
    }
    return finalColumns;
  }

  public static getKey(data: Record<string, unknown> & { __draftId?: string }): string {
    return (data.__draftId || data[VXE_TABLE_X_ID]) as string;
  }
}
