/**
 * 可编辑表格校验文案行高。
 * 全表基准行高仍由 CSS `height` 控制；只有出现校验文案的行写行内高度。
 */

/** DefaultTable provide、TableEditorItem inject 使用的调度函数 key */
export const TABLE_VALIDATION_ROW_HEIGHT_KEY = 'defaultTableSyncValidationRowHeight';

/** 标记本功能写过行内高度的行，清除时只处理这些行 */
export const VALIDATION_ROW_HEIGHT_ATTR = 'data-validation-row-height';

/**
 * 这一列能不能拿来采样全表基准行高。
 * 带校验文案，或已经被校验行高撑开的行，都不能写入全表行高。
 * @param column 表体单元格
 */
export function isValidationHeightSource(column: Element): boolean {
  const row = column.closest('.vxe-body--row');
  if (!row) {
    return false;
  }
  if (row.hasAttribute(VALIDATION_ROW_HEIGHT_ATTR)) {
    return true;
  }
  return !!row.querySelector('.ant-form-item-explain');
}

/**
 * 按选择器找第一个不带校验文案的单元格，用作全表行高采样。
 * @param tableEle 表格根节点
 * @param selector 单元格选择器
 * @returns 可采样的单元格；全部行都有校验时返回 undefined
 */
export function pickNonValidationColumn(tableEle: HTMLElement, selector: string): HTMLElement | undefined {
  const columns = tableEle.querySelectorAll<HTMLElement>(selector);
  for (let index = 0; index < columns.length; index++) {
    const column = columns[index];
    if (!isValidationHeightSource(column)) {
      return column;
    }
  }
  return undefined;
}

/**
 * 清掉本功能写在行和单元格上的行内高度。
 * 单元格样式表里的 `height` 优先级高于 tr，所以行内高度要同时写在 td 上，清除时也要一起去掉。
 * @param row 主表或冻结表中的一行
 */
function clearValidationRowHeight(row: HTMLElement | undefined): void {
  if (!row?.hasAttribute(VALIDATION_ROW_HEIGHT_ATTR)) {
    return;
  }
  row.style.height = '';
  const cells = row.querySelectorAll<HTMLElement>('.vxe-body--column');
  for (let index = 0; index < cells.length; index++) {
    cells[index].style.height = '';
  }
  row.removeAttribute(VALIDATION_ROW_HEIGHT_ATTR);
}

/**
 * 把同一行的 tr 和 td 设成同一个像素高度，盖过样式表里的固定 height。
 * @param row 主表或冻结表中的一行
 * @param height 目标行高（px）
 */
function applyValidationRowHeight(row: HTMLElement, height: number): void {
  const px = `${height}px`;
  row.style.height = px;
  const cells = row.querySelectorAll<HTMLElement>('.vxe-body--column');
  for (let index = 0; index < cells.length; index++) {
    cells[index].style.height = px;
  }
  row.setAttribute(VALIDATION_ROW_HEIGHT_ATTR, 'true');
}

/**
 * 读取该行编辑项的内容高度。
 * 不用行的 clientHeight：单元格 CSS height 会把行盒子卡在基准高度，校验文案是画出去的。
 * offsetHeight 读的是表单项自身，再加上单元格上下 padding / border，避免文案底边被下一行挡住。
 * @param row 主表行
 */
function readEditorContentHeight(row: HTMLElement): number {
  let contentHeight = 0;
  const editors = row.querySelectorAll<HTMLElement>('.default-table-editor-item');
  for (let index = 0; index < editors.length; index++) {
    const editor = editors[index];
    const cell = editor.closest('.vxe-cell');
    let extra = 0;
    if (cell) {
      const style = getComputedStyle(cell);
      extra =
        (parseFloat(style.paddingTop) || 0) +
        (parseFloat(style.paddingBottom) || 0) +
        (parseFloat(style.borderTopWidth) || 0) +
        (parseFloat(style.borderBottomWidth) || 0);
    }
    contentHeight = Math.max(contentHeight, editor.offsetHeight + extra);
  }
  return contentHeight;
}

/**
 * 读取冻结行里实际内容的高度，不用 tr 的 clientHeight（那会被行内高度或 CSS height 卡住）。
 * @param row 冻结行；没有冻结列时为空
 */
function readFixedContentHeight(row: HTMLElement | undefined): number {
  if (!row) {
    return 0;
  }
  let contentHeight = 0;
  const cells = row.querySelectorAll<HTMLElement>('.vxe-cell');
  for (let index = 0; index < cells.length; index++) {
    const children = cells[index].children;
    for (let childIndex = 0; childIndex < children.length; childIndex++) {
      contentHeight = Math.max(contentHeight, (children[childIndex] as HTMLElement).offsetHeight);
    }
  }
  return contentHeight;
}

export interface SyncValidationRowHeightOptions {
  /** 当前行高类型下的基准行高，校验行不得低于它 */
  baselinePx: number;
  /** 表格配置的最小行高 */
  minLineHeight: number;
}

/**
 * 按主表 body 行同步校验行高度。
 * 主表行数和某一侧冻结行数不一致时，跳过该侧，不按 index 猜测对应关系。
 * @param tableEle 表格根节点
 * @param options 基准行高和最小行高
 */
export function syncValidationRowHeights(tableEle: HTMLElement, options: SyncValidationRowHeightOptions): void {
  const mainRows = tableEle.querySelectorAll<HTMLElement>('.vxe-table--main-wrapper .vxe-table--body .vxe-body--row');
  const leftRows = tableEle.querySelectorAll<HTMLElement>(
    '.vxe-table--fixed-wrapper .vxe-table--fixed-left-wrapper .vxe-body--row'
  );
  const rightRows = tableEle.querySelectorAll<HTMLElement>(
    '.vxe-table--fixed-wrapper .vxe-table--fixed-right-wrapper .vxe-body--row'
  );
  const leftAligned = leftRows.length === 0 || leftRows.length === mainRows.length;
  const rightAligned = rightRows.length === 0 || rightRows.length === mainRows.length;
  const floor = Math.max(options.baselinePx || 0, options.minLineHeight || 0);

  for (let index = 0; index < mainRows.length; index++) {
    const row = mainRows[index];
    const leftRow = leftAligned ? leftRows[index] : undefined;
    const rightRow = rightAligned ? rightRows[index] : undefined;
    if (!row.querySelector('.ant-form-item-explain')) {
      clearValidationRowHeight(row);
      clearValidationRowHeight(leftRow);
      clearValidationRowHeight(rightRow);
      continue;
    }
    const nextHeight = Math.ceil(
      Math.max(readEditorContentHeight(row), readFixedContentHeight(leftRow), readFixedContentHeight(rightRow), floor)
    );
    if (nextHeight <= 0) {
      continue;
    }
    applyValidationRowHeight(row, nextHeight);
    if (leftRow) {
      applyValidationRowHeight(leftRow, nextHeight);
    }
    if (rightRow) {
      applyValidationRowHeight(rightRow, nextHeight);
    }
  }
}
