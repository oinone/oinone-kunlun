import { ReturnPromise } from '@kunlun/shared';
import { OioComponentData } from '@kunlun/vue-ui-common';
import { PropType } from 'vue';
import { TableEditorCloseTrigger, TableEditorMode, TableEditorTrigger } from '../table';
import { CellRenderFunction, RenderCellContext, RowContext } from '../typing';
import { ColumnAlignType, ColumnFixedType } from './typing';

export const OioColumnAppearanceProps = {
  width: {
    type: [String, Number]
  },
  minWidth: {
    type: [String, Number]
  },
  label: {
    type: String
  },
  className: {
    type: [String, Function] as PropType<string | ((context: RenderCellContext) => string)>
  },
  headerClassName: {
    type: [String, Function] as PropType<string | ((context: RenderCellContext) => string)>
  },
  footerClassName: {
    type: [String, Function] as PropType<string | ((context: RenderCellContext) => string)>
  },
  align: {
    type: String as PropType<ColumnAlignType | keyof typeof ColumnAlignType>
  },
  headerAlign: {
    type: String as PropType<ColumnAlignType | keyof typeof ColumnAlignType>
  },
  footerAlign: {
    type: String as PropType<ColumnAlignType | keyof typeof ColumnAlignType>
  },
  fixed: {
    type: [String, Boolean] as PropType<ColumnFixedType | keyof typeof ColumnFixedType | false>,
    default: undefined
  },
  invisible: {
    type: Boolean,
    default: false
  }
};

export const OioColumnEditorProps = {
  editable: {
    type: Boolean,
    default: false
  },
  cellEditable: {
    type: [Boolean, Function] as PropType<boolean | ((context: RowContext) => boolean)>,
    default: undefined
  },
  editorTrigger: {
    type: String as PropType<TableEditorTrigger | keyof typeof TableEditorTrigger>,
    default: TableEditorTrigger.manual
  },
  editorMode: {
    type: String as PropType<TableEditorMode | keyof typeof TableEditorMode>,
    default: TableEditorMode.cell
  },
  editorCloseTrigger: {
    type: String as PropType<TableEditorCloseTrigger | keyof typeof TableEditorCloseTrigger>,
    default: TableEditorCloseTrigger.manual
  },
  disableEditorRender: {
    type: Boolean,
    default: false
  },
  rowEditorClosedByEnter: {
    type: Function as PropType<(context: RowContext) => ReturnPromise<boolean>>
  },
  rowEditorClosedByCancel: {
    type: Function as PropType<(context: RowContext) => ReturnPromise<boolean>>
  }
};

export const OioColumnControlProps = {
  type: {
    type: String
  },
  field: {
    type: String
  },
  invisibleContent: {
    type: [Boolean, Function] as PropType<boolean | ((context: RowContext) => boolean)>,
    default: undefined
  },
  sortable: {
    type: Boolean,
    default: false
  }
};

export const OioColumnRenderFunctionProps = {
  renderDefaultSlot: {
    type: Function as PropType<CellRenderFunction>
  },
  renderEditSlot: {
    type: Function as PropType<CellRenderFunction>
  },
  renderContentSlot: {
    type: Function as PropType<CellRenderFunction>
  }
};

export const OioColumnProps = {
  ...OioColumnAppearanceProps,
  ...OioColumnEditorProps,
  ...OioColumnControlProps,
  ...OioColumnRenderFunctionProps,
  ...OioComponentData
};
