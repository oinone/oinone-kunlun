import { isBoolean, isFunction } from 'lodash-es';
import type { RowContext, VxeTableRowContext } from '../typing';

export function executeCellEditable(
  context: VxeTableRowContext,
  cellEditable: boolean | ((context: RowContext) => unknown) | undefined
): boolean {
  if (cellEditable == null) {
    return true;
  }
  if (isBoolean(cellEditable)) {
    return cellEditable;
  }
  if (isFunction(cellEditable)) {
    const res = cellEditable(context);
    if (res != null) {
      return !!res;
    }
  }
  return true;
}
