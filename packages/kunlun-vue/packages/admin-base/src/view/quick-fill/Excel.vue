<template>
  <div class="quick-fill-excel-container">
    <table
      :class="{
        'excel-table': true,
        'excel-table-selecting': isSelecting
      }"
      ref="tableRef"
      @keydown="handleKeydown"
      @copy="handleCopy"
      @cut="handleCut"
      @paste="handlePaste"
      tabindex="0"
    >
      <thead>
        <tr>
          <th class="corner-cell"></th>
          <!-- 生成列标题  -->
          <th
            v-for="(field, index) in modelFields"
            :key="field.name"
            class="column-header"
            :style="{ width: cellWidth + 'px' }"
          >
            <a-select
              class="oio-select"
              dropdown-class-name="oio-select-dropdown"
              :options="selectOptions"
              :value="getThSelectValue(index)"
              @change="(value, option) => onChangeTableHeader(value, option, index)"
            ></a-select>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row">
          <!-- 行号 -->
          <td class="row-header">{{ row }}</td>
          <!-- 单元格 -->
          <td
            v-for="(col, index) in columns"
            :key="`${row}-${col}`"
            :class="{
              cell: true,
              selected: isSelected(`${row}-${col}`),
              editing: isEditing(`${row}-${col}`),
              'range-selected': isRangeSelected(`${row}-${col}`),
              'cell-disabled': tableHeaderValues[index].readonly
            }"
            :data-cell="`${row}-${col}`"
            @click="handleCellClick($event, `${row}-${col}`, index)"
            @mousedown="handleCellMouseDown(`${row}-${col}`)"
            @dblclick="startEditing(`${row}-${col}`)"
            @focus="focusCell(`${row}-${col}`)"
            tabindex="0"
            :style="{ width: cellWidth + 'px', height: cellHeight + 'px' }"
          >
            <!-- 编辑状态显示输入框 -->
            <input
              ref="inputRef"
              v-if="isEditing(`${row}-${col}`)"
              :value="getCellContent(`${row}-${col}`)"
              @input="updateCellContent(`${row}-${col}`, $event.target.value)"
              @blur="stopEditing"
              @keydown.enter="handleEnter"
              @keydown="handleCellKeydown"
              @compositionstart="isComposing = true"
              @compositionend="isComposing = false"
              @focus="$event.target.select()"
              class="cell-input"
              type="text"
            />
            <!-- 非编辑状态显示内容 -->
            <span v-else class="cell-content">{{ getCellContent(`${row}-${col}`) }}</span>
          </td>
        </tr>
        <tr v-for="row in disabledRows" :key="row">
          <td class="row-header cell-disabled">{{ row }}</td>
          <td v-for="col in columns" :key="`${row}-${col}`" class="cell cell-disabled"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { RuntimeModelField } from '@oinone/kunlun-engine';
import { Select as ASelect, SelectOption } from 'ant-design-vue';
import { computed, defineExpose, defineProps, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { NON_CUT } from './type';

interface CellIndices {
  row: number;
  col: number;
}

interface ParsedCellId {
  row: number;
  col: number;
}

type CellId = string;

const props = defineProps<{
  modelFields: RuntimeModelField[];
  rowCount: number; // 行数
  addRowCount: (addNumber: number) => void;
}>();

const cellWidth = 110; // 单元格宽度
const cellHeight = 30; // 单元格高度
const colCount = computed(() => props.modelFields.length || 0); // 列数
const hasChangeCellValue = ref(false);
// 表头下拉选中的值
const tableHeaderValues = ref<{ label: string; value: string; readonly: boolean }[]>([]);

// 表头下拉选项
const selectOptions = computed(() => {
  const options = props.modelFields.map((field, i) => {
    return {
      label: field.label || field.displayName,
      value: field.name,
      readonly: field.readonly
    };
  });
  options.unshift({
    label: '不粘贴',
    value: NON_CUT,
    readonly: true
  });

  return options;
});

// ======== 状态 =========
const tableRef = ref<HTMLTableElement | null>(null); // 表格引用
const inputRef = ref<(HTMLInputElement | null)[]>([]); // 输入框引用数组
const selectedCell = ref<CellId>(''); // 当前活动/起始选中的单元格
const editingCell = ref<CellId | null>(null); // 当前正在编辑的单元格
const cells = ref<Record<CellId, string>>({}); // 存储单元格内容的对象
const isComposing = ref(false); // 输入框是否正在输入汉字

// ======== 多选状态 =========
const isSelecting = ref(false); // 是否正在拖拽选择
const selectionStart = ref<CellId | null>(null); // 框选的起始单元格
const selectionEnd = ref<CellId | null>(null); // 框选的结束单元格 (即当前鼠标位置)
const selectionRange = ref<Set<CellId>>(new Set()); // 存储当前选区内的所有单元格 ID

const initTableHeaderValues = () => {
  tableHeaderValues.value = props.modelFields.map((v, i) => ({
    value: v.name,
    label: v.displayName || v.label || '',
    readonly: v.readonly as boolean
  }));
};

watch(
  () => props.modelFields,
  () => {
    initTableHeaderValues();
  },
  { immediate: true, deep: true }
);

const generateColumnName = (index: number) => {
  let columnName = '';
  let tempIndex = index;
  while (tempIndex >= 0) {
    columnName = String.fromCharCode((tempIndex % 26) + 65) + columnName;
    tempIndex = Math.floor(tempIndex / 26) - 1;
  }
  return index + 1;
};

const columns = Array.from({ length: colCount.value }, (_, i) => generateColumnName(i));
const rows = computed(() => Array.from({ length: props.rowCount }, (_, i) => i + 1));
const disabledRows = computed(() => {
  const basic = props.rowCount || 0;
  const l = 9 - basic;
  if (l >= 1) {
    return Array.from({ length: l }, (_, i) => basic + i + 1);
  }
  return [];
});

// ======== 方法 =========

// 修改表头
const onChangeTableHeader = (value, option, index) => {
  tableHeaderValues.value[index].value = value;
  tableHeaderValues.value[index].readonly = option.readonly;
};

const getThSelectValue = (index) => {
  return tableHeaderValues.value[index].value;
};

// 获取单元格 ID 的行和列
const parseCellId = (cellId: CellId): ParsedCellId | null => {
  const match = cellId.match(/(\d+)-(.+)/);
  return match ? { row: parseInt(match[1]), col: parseInt(match[2]) } : null;
};

// 获取单元格内容
const getCellContent = (cellId: CellId): string => {
  const val = cells.value[cellId];
  if (val == null) {
    return '';
  }
  return `${val}`;
};

// 更新单元格内容
const updateCellContent = (cellId: CellId, value: string): void => {
  hasChangeCellValue.value = true;
  cells.value[cellId] = value;
};

// 检查单元格是否是活动选中 (单个)
const isSelected = (cellId: CellId): boolean => {
  return selectedCell.value === cellId;
};

// 检查单元格是否在选区范围内
const isRangeSelected = (cellId: CellId): boolean => {
  return selectionRange.value.has(cellId);
};

// 检查单元格是否正在编辑
const isEditing = (cellId: CellId): boolean => {
  return editingCell.value === cellId;
};

// 获取单元格的行列索引
const getCellIndices = (cellId: CellId): CellIndices | null => {
  const parsed = parseCellId(cellId);
  if (!parsed) {
    return null;
  }
  const rowIdx = parsed.row - 1; // 转换为 0-based 索引
  const colIdx = columns.indexOf(parsed.col);
  return colIdx >= 0 ? { row: rowIdx, col: colIdx } : null;
};

// 根据行列索引获取单元格 ID
const getCellId = (rowIdx: number, colIdx: number): CellId | null => {
  if (rowIdx >= 0 && rowIdx < props.rowCount && colIdx >= 0 && colIdx < colCount.value) {
    return `${rowIdx + 1}-${columns[colIdx]}`;
  }
  return null;
};

// 计算并更新选区范围
const updateSelectionRange = (startId: CellId, endId: CellId): void => {
  const startIndices = getCellIndices(startId);
  const endIndices = getCellIndices(endId);
  if (!startIndices || !endIndices) {
    return;
  }

  const { row: startRow, col: startCol } = startIndices;
  const { row: endRow, col: endCol } = endIndices;

  // 确定矩形区域的边界
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);
  const minCol = Math.min(startCol, endCol);
  const maxCol = Math.max(startCol, endCol);

  const newRange = new Set<CellId>();
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const cellId = getCellId(r, c);
      if (cellId) {
        newRange.add(cellId);
      }
    }
  }
  selectionRange.value = newRange;
  // 选区结束点也作为当前活动单元格 (用于粘贴起点)
  selectedCell.value = endId;
};

// 初始化单选
const initializeSingleSelection = (cellId: CellId): void => {
  selectionStart.value = cellId;
  selectionEnd.value = cellId;
  const newRange = new Set<CellId>();
  newRange.add(cellId);
  selectionRange.value = newRange;
  selectedCell.value = cellId;
};

// 处理单元格点击
const handleCellClick = (event: MouseEvent, cellId: CellId, index: number): void => {
  // 如果是 不粘贴列/右键/编辑状态 下的点击，不处理多选
  if (getThSelectValue(index) === NON_CUT || event.button !== 0 || editingCell.value) {
    return;
  }
  if (event.shiftKey) {
    // Shift + 点击：扩展选区到点击的单元格
    if (selectionStart.value) {
      updateSelectionRange(selectionStart.value, cellId);
    } else {
      // 如果没有起始点，从当前 selectedCell 开始
      updateSelectionRange(selectedCell.value, cellId);
    }
  } else if (event.ctrlKey || event.metaKey) {
    // Ctrl/Cmd + 点击：待实现 (可选，如添加到选区)
    // 当前简化为单选
    initializeSingleSelection(cellId);
  } else {
    // 普通点击：单选
    initializeSingleSelection(cellId);
  }
};

// 处理单元格 mousedown (用于拖拽选择)
const handleCellMouseDown = (cellId: CellId): void => {
  if (editingCell.value) {
    return;
  } // 编辑状态下不响应
  isSelecting.value = true;
  selectionStart.value = cellId;
  selectionEnd.value = cellId;
  updateSelectionRange(cellId, cellId);
  // 添加全局 mousemove 和 mouseup 监听器
  document.addEventListener('mousemove', handleGlobalMouseMove);
  document.addEventListener('mouseup', handleGlobalMouseUp);
};

// 全局 mousemove 处理 (拖拽选择)
const handleGlobalMouseMove = (event: MouseEvent): void => {
  if (!isSelecting.value) {
    return;
  }
  const targetCell = event.target as HTMLElement;
  const tdElement = targetCell.closest('td[data-cell]') as HTMLElement;
  if (tdElement) {
    const cellId = tdElement.dataset.cell;
    if (cellId && cellId !== selectionEnd.value) {
      selectionEnd.value = cellId;
      updateSelectionRange(selectionStart.value!, cellId);
    }
  }
};

// 全局 mouseup 处理 (结束拖拽)
const handleGlobalMouseUp = (): void => {
  isSelecting.value = false;
  document.removeEventListener('mousemove', handleGlobalMouseMove);
  document.removeEventListener('mouseup', handleGlobalMouseUp);
};

// 使单元格获得焦点 (主要用于键盘导航)
const focusCell = (cellId: CellId): void => {
  selectedCell.value = cellId;
  // 如果没有选区，初始化一个单单元格选区
  if (selectionRange.value.size === 0 || !selectionRange.value.has(cellId)) {
    initializeSingleSelection(cellId);
  }
};

// 开始编辑单元格
const startEditing = (cellId: CellId, initialInput: string | null = null): void => {
  const node = document.querySelector(`[data-cell='${cellId}']`);
  if (node?.classList.contains('cell-disabled')) {
    return;
  }

  // 编辑时，只编辑活动单元格，不编辑整个选区
  selectedCell.value = cellId;
  editingCell.value = cellId;

  if (initialInput !== null) {
    updateCellContent(cellId, '');
  }

  nextTick(() => {
    const inputs = inputRef.value;
    if (Array.isArray(inputs)) {
      const input = inputs.find((inp) => (inp?.parentNode as HTMLElement)?.closest('td')?.dataset?.cell === cellId);
      if (input) {
        input.focus();
        if (initialInput !== null && initialInput !== 'Backspace' && initialInput !== 'Delete') {
          input.value = initialInput;
          const inputEvent = new Event('input', { bubbles: true });
          input.dispatchEvent(inputEvent);
        } else {
          input.select();
        }
      }
    }
  });
};

// 停止编辑
const stopEditing = (): void => {
  editingCell.value = null;
  tableRef.value?.focus();
};

// 处理 Enter 键 (编辑中)
const handleEnter = (): void => {
  if (isComposing.value) {
    return;
  }

  stopEditing();
  const parsed = parseCellId(selectedCell.value);
  if (parsed && parsed.row < props.rowCount) {
    const nextCellId = `${parsed.row + 1}-${parsed.col}`;
    // 普通导航，不扩展选区
    initializeSingleSelection(nextCellId);
  }
};

// 处理单元格内的键盘事件
const handleCellKeydown = (event: KeyboardEvent): void => {
  // const { key } = event;
  // const parsed = parseCellId(selectedCell.value);
  // if (!parsed || !selectionStart.value) return;
  // 在编辑状态下，方向键和Tab也用于导航，但会先停止编辑
  // if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
  //   event.preventDefault();
  //   stopEditing();
  //   return;
  // }
  // 其他键由输入框处理
};

// 处理表格级别的键盘事件 (方向键导航和字符输入)
const handleKeydown = (event: KeyboardEvent): void => {
  const { key, shiftKey, ctrlKey, metaKey, altKey } = event;
  const parsed = parseCellId(selectedCell.value);
  if (!parsed || !selectionStart.value) {
    return;
  }

  // 如果正在编辑，让单元格内的输入框处理事件
  if (editingCell.value) {
    return;
  }

  // 检查是否是常见的快捷键 (Ctrl/Command + C, V, X, A 等)
  const isCtrlCmd = ctrlKey || metaKey;
  if (isCtrlCmd) {
    // 阻止浏览器的默认复制/粘贴/剪切行为，由我们自己处理
    if (['c', 'v', 'x', 'a'].includes(key.toLowerCase())) {
      // event.preventDefault();
      return;
    }
    return;
  }

  // 检查是否是 Alt 键组合
  if (altKey) {
    return;
  }

  // 处理方向键导航 (支持 Shift 扩展选区)
  const moveAndSelect = (newRow: number, newCol: number): void => {
    const newCellId = `${newRow}-${newCol}`;
    if (shiftKey) {
      updateSelectionRange(selectionStart.value!, newCellId);
    } else {
      initializeSingleSelection(newCellId);
    }
  };

  const currentRow = parsed.row;
  const currentCol = parsed.col;
  const currentColIdx = columns.indexOf(currentCol);

  switch (key) {
    case 'ArrowUp':
      event.preventDefault();
      if (currentRow > 1) {
        moveAndSelect(currentRow - 1, currentCol);
      }
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (currentRow < props.rowCount) {
        moveAndSelect(currentRow + 1, currentCol);
      }
      break;
    case 'ArrowLeft':
      event.preventDefault();
      if (currentColIdx > 0) {
        moveAndSelect(currentRow, columns[currentColIdx - 1]);
      }
      break;
    case 'ArrowRight':
      event.preventDefault();
      if (currentColIdx < columns.length - 1) {
        moveAndSelect(currentRow, columns[currentColIdx + 1]);
      }
      break;
    case 'Tab':
      event.preventDefault();
      if (!event.shiftKey && currentColIdx < columns.length - 1) {
        moveAndSelect(currentRow, columns[currentColIdx + 1]);
      } else if (event.shiftKey && currentColIdx > 0) {
        moveAndSelect(currentRow, columns[currentColIdx - 1]);
      } else if (!event.shiftKey && currentRow < props.rowCount) {
        moveAndSelect(currentRow + 1, columns[0]);
      } else if (event.shiftKey && currentRow > 1) {
        moveAndSelect(currentRow - 1, columns[columns.length - 1]);
      }
      break;
    case 'Enter':
      event.preventDefault();
      startEditing(selectedCell.value);
      break;
    default:
      if (key.length === 1) {
        event.preventDefault();
        startEditing(selectedCell.value, key);
      } else if (key === 'Backspace' || key === 'Delete') {
        event.preventDefault();
        selectionRange.value.forEach((cellId) => {
          updateCellContent(cellId, '');
        });
      }
  }
};

// 处理复制 (Copy)
const handleCopy = (event: ClipboardEvent): void => {
  if (inputRef.value.length) {
    return;
  }

  event.preventDefault();
  if (selectionRange.value.size === 0) {
    return;
  }

  let minRow = props.rowCount;
  let maxRow = 1;
  let minCol = colCount.value;
  let maxCol = 1;
  selectionRange.value.forEach((cellId) => {
    const indices = getCellIndices(cellId);
    if (indices) {
      minRow = Math.min(minRow, indices.row);
      maxRow = Math.max(maxRow, indices.row);
      minCol = Math.min(minCol, indices.col);
      maxCol = Math.max(maxCol, indices.col);
    }
  });

  let clipboardText = '';
  for (let r = minRow; r <= maxRow; r++) {
    const rowCells: string[] = [];
    for (let c = minCol; c <= maxCol; c++) {
      const cellId = getCellId(r, c);
      rowCells.push(cellId ? getCellContent(cellId) : '');
    }
    clipboardText += `${rowCells.join('\t')}\n`;
  }
  clipboardText = clipboardText.slice(0, -1);

  event.clipboardData?.setData('text/plain', clipboardText);
};

// 处理剪切 (Cut)
const handleCut = (event: ClipboardEvent): void => {
  if (inputRef.value.length) {
    return;
  }

  handleCopy(event);
  selectionRange.value.forEach((cellId) => {
    updateCellContent(cellId, '');
  });
  initializeSingleSelection(selectionStart.value!);
};

// 处理粘贴 (Paste)
const handlePaste = (event: ClipboardEvent): void => {
  if (inputRef.value.length) {
    return;
  }

  event.preventDefault();
  const clipboardData = event.clipboardData || (window as any).clipboardData;
  const pastedData = clipboardData.getData('text/plain');
  if (!pastedData || selectionRange.value.size === 0) {
    return;
  }

  const pasteStartParsed = parseCellId(selectedCell.value);
  if (!pasteStartParsed) {
    return;
  }

  const { row: startRow, col: startCol } = pasteStartParsed;
  const startColIdx = columns.indexOf(startCol);
  if (startColIdx === -1) {
    return;
  }

  // 解析CSV格式的粘贴数据，正确处理双引号包裹的换行文本
  const parseCSVData = (data: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let insideQuotes = false;
    let i = 0;

    while (i < data.length) {
      const char = data[i];
      const nextChar = data[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // 转义的双引号 ("")，添加一个双引号到单元格内容
          currentCell += '"';
          i += 2; // 跳过两个字符
          continue;
        } else {
          // 开始或结束引号
          insideQuotes = !insideQuotes;
        }
      } else if (char === '\t' && !insideQuotes) {
        // 制表符分隔符，且不在引号内
        currentRow.push(currentCell);
        currentCell = '';
      } else if (char === '\n' && !insideQuotes) {
        // 换行符，且不在引号内
        currentRow.push(currentCell);
        if (currentRow.some((cell) => cell.trim() !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        // 普通字符或引号内的换行
        currentCell += char;
      }
      i++;
    }

    // 处理最后一个单元格和行
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell);
      if (currentRow.some((cell) => cell.trim() !== '')) {
        rows.push(currentRow);
      }
    }

    return rows;
  };

  const rowsData = parseCSVData(pastedData);
  let currentRowOffset = 0;
  const canUseRow = props.rowCount - startRow + 1; // 粘贴的那一行也可以使用
  if (canUseRow < rowsData.length) {
    props.addRowCount(rowsData.length - canUseRow);
  }
  nextTick(() => {
    rowsData.forEach((cellsData) => {
      let currentColOffset = 0;
      cellsData.forEach((cellData) => {
        const targetRowIdx = startRow + currentRowOffset - 1;
        const targetColIdx = startColIdx + currentColOffset;
        if (tableHeaderValues.value[targetColIdx].readonly) {
          currentColOffset++;
          return;
        }
        if (targetRowIdx < props.rowCount && targetColIdx < columns.length) {
          const targetCellId = `${targetRowIdx + 1}-${columns[targetColIdx]}`;
          updateCellContent(targetCellId, cellData.trim());
        }
        currentColOffset++;
      });
      currentRowOffset++;
    });

    initializeSingleSelection(selectedCell.value);
    if (editingCell.value) {
      stopEditing();
    }
  });
};

const convertCellsToArray = (obj: Record<CellId, string>) => {
  const result = [] as (string | null)[][];
  const rows = new Set();
  let maxRow = 0;
  let maxCol = 0;

  // 收集所有行号和列号，并计算最大行和最大列
  Object.keys(obj).forEach((key) => {
    const [row, col] = key.split('-').map(Number);
    rows.add(row);
    if (row > maxRow) {
      maxRow = row;
    }
    if (col > maxCol) {
      maxCol = col;
    }
  });

  // 从第1行到最大行，依次处理
  for (let row = 1; row <= maxRow; row++) {
    const currentRow = [] as (string | null)[];
    // 从第1列到最大列，检查是否存在该键
    for (let col = 1; col <= maxCol; col++) {
      const key = `${row}-${col}`;
      currentRow.push(obj.hasOwnProperty(key) ? obj[key] : null);
    }
    result.push(currentRow);
  }

  return result;
};

defineExpose({
  getOriginCells() {
    return cells.value;
  },
  getCells() {
    return convertCellsToArray(cells.value);
  },
  getTableHeaderValues() {
    return tableHeaderValues.value;
  },
  setCells(value) {
    cells.value = value;
  },
  getCellStatus() {
    return hasChangeCellValue.value;
  },
  resetExcel() {
    cells.value = {};
    selectedCell.value = '';
    editingCell.value = null;
    selectionStart.value = null;
    selectionEnd.value = null;
    selectionRange.value = new Set();
    hasChangeCellValue.value = false;
    tableHeaderValues.value = [];
    initTableHeaderValues();
  }
});

// ======== 生命周期 =========
onMounted(() => {
  tableRef.value?.focus();
  initializeSingleSelection('1-A');
});

// 组件卸载时清理事件监听器
onUnmounted(() => {
  document.removeEventListener('mousemove', handleGlobalMouseMove);
  document.removeEventListener('mouseup', handleGlobalMouseUp);
});
</script>

<style lang="scss">
.quick-fill-excel-container {
  width: 100%;
  min-height: 400px;
  height: 400px;
  overflow: auto;

  .excel-table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    outline: none;

    th,
    td {
      background-image: linear-gradient(var(--oio-table-row-body-border), var(--oio-table-row-body-border)),
        linear-gradient(var(--oio-table-row-body-border), var(--oio-table-row-body-border));
      padding: 0;
      margin: 0;
      text-align: left;
      vertical-align: top;
      background-repeat: no-repeat;
      background-size: 1px 100%, 100% 1px;
      background-position: 100% 0, 100% 100%;
      box-sizing: border-box;
    }

    .corner-cell {
      background-color: var(--oio-table-thead-bg);
      text-align: center;
      width: 40px;
      position: sticky;
      top: 0;
      left: 0;
      z-index: 10;
    }

    .column-header {
      background-color: var(--oio-table-thead-bg);
      text-align: center;
      height: 40px;
      z-index: 3;
      position: sticky;
      top: 0;
      user-select: none;
      padding: 4px;
    }

    .row-header {
      background-color: #fff;
      text-align: center;
      width: 40px;
      line-height: 40px;
      position: sticky;
      left: 0;
      color: var(--oio-text-color-secondary);
      z-index: 10;
      user-select: none;

      &.cell-disabled {
        cursor: not-allowed;
        background-color: var(--oio-table-thead-bg);
        color: var(--oio-disabled-color);
      }
    }

    .cell {
      position: relative;
      cursor: default;

      &.selected {
        border: 1px solid var(--oio-primary-color);
        z-index: 5;
      }

      &.range-selected {
        border: 1px solid var(--oio-primary-color);
      }

      &.editing {
        z-index: 2;
      }

      &.cell-disabled {
        cursor: not-allowed;
        background-color: var(--oio-table-thead-bg);
        color: var(--oio-disabled-color);
      }

      .cell-content {
        display: block;
        padding: 5px 8px;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        outline: none;
        display: flex;
        align-items: center;
      }

      &:focus-visible {
        outline: none;
      }
    }

    .cell-input {
      position: absolute;
      top: 2px;
      left: 2px;
      right: 2px;
      bottom: 2px;
      border: none;
      padding: 5px 7px;
      margin: 0;
      font: inherit;
      box-sizing: border-box;
      outline: none;
      z-index: 10;
    }

    &.excel-table-selecting {
      user-select: none;
    }
  }
}
</style>
