import { TableColumnMinWidthComputeConfigContext } from './config';

const CHINESE_REG_EXP = new RegExp(/[\u4E00-\u9FA5]/g);

export const defaultTableColumnMinWidthComputeContext: TableColumnMinWidthComputeConfigContext = {
  min: 120,
  max: 432,
  chineseWidth: 14,
  otherWidth: 9,
  sortableFixWidth: 40,
  nonSortableFixWidth: 22,
  sortable: false
};

export function defaultTableColumnMinWidthCompute(label: string, context: TableColumnMinWidthComputeConfigContext) {
  const { min, max, chineseWidth, otherWidth, sortableFixWidth, nonSortableFixWidth, sortable } = context;
  const chineseCount = label.match(CHINESE_REG_EXP)?.length || 0;
  const otherCount = label.length - chineseCount;
  let minWidth = chineseCount * chineseWidth + otherCount * otherWidth;
  if (sortable) {
    minWidth += sortableFixWidth;
  } else {
    minWidth += nonSortableFixWidth;
  }
  if (minWidth < min) {
    return min;
  }
  if (minWidth > max) {
    return max;
  }
  return minWidth;
}
