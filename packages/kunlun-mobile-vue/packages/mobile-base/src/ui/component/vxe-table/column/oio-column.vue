<script lang="ts">
import { StringHelper } from '@oinone/kunlun-shared';
import { OioIcon, PropRecordHelper, StyleHelper } from '@oinone/kunlun-vue-ui-common';
import { debounce, isBoolean, isFunction, isNil, isString } from 'lodash-es';
import { computed, createVNode, defineComponent, Slot, VNode, vShow, watch, withDirectives, withModifiers } from 'vue';
import { Column } from 'vxe-table';
import { DEFAULT_PREFIX } from '../../../theme';
import { useInjectOioTableInstance } from '../context';
import { TableEditorCloseTrigger, TableEditorMode, TableEditorTrigger } from '../table';
import { CellRenderFunction, RowContext, VxeTableCellRenderFunction, VxeTableRowContext } from '../typing';
import { OioColumnProps } from './props';

const DEFAULT_CLASS_NAME = `${DEFAULT_PREFIX}-column`;

interface RenderRowContext {
  rowid: string;
  row: Record<string, unknown>;
  rowIndex: number;
}

const renderMethods = {
  default: 'renderDefaultSlot',
  edit: 'renderEditSlot',
  content: 'renderContentSlot'
};

function renderMethodExecutor(context: RenderRowContext, fn: CellRenderFunction): VNode[] {
  const { rowid, row, rowIndex } = context;
  const result = fn({
    key: rowid,
    data: row,
    index: rowIndex,
    origin: context
  });
  if (isString(result) || isBoolean(result)) {
    return [createVNode('span', {}, result)];
  }
  return result;
}

function appendDefaultClassName(classList: string | string[] | undefined) {
  return StringHelper.append([DEFAULT_CLASS_NAME], classList);
}

function executeCellEditable(
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

const SEQ_TYPE = 'seq';

export default defineComponent({
  name: 'OioColumn',
  components: {
    Column
  },
  inheritAttrs: false,
  props: {
    ...OioColumnProps
  },
  setup(props) {
    const tableInstance = useInjectOioTableInstance();

    const width = computed(() => {
      if (isNil(props.width)) {
        return undefined;
      }
      return StyleHelper.px(props.width);
    });

    const minWidth = computed(() => {
      if (isNil(props.minWidth)) {
        return undefined;
      }
      return StyleHelper.px(props.minWidth);
    });

    const fixed = computed(() => {
      const value = props.fixed;
      if (isNil(value) || isBoolean(value)) {
        return undefined;
      }
      return value;
    });

    const activeCellEditor = (context: VxeTableRowContext) => {
      const { origin } = context;
      tableInstance?.activeCellEditor(origin.row, origin.column);
    };

    const closeCellEditorByEnter = async (context: VxeTableRowContext) => {
      let res = await props.rowEditorClosedByEnter?.(context);
      if (res == null) {
        res = true;
      }
      if (res) {
        tableInstance?.clearEditor();
      }
    };

    const closeCellEditorByCancel = async (context: VxeTableRowContext) => {
      let res = await props.rowEditorClosedByCancel?.(context);
      if (res == null) {
        res = true;
      }
      if (res) {
        tableInstance?.clearEditor();
      }
    };

    const className = (event) => {
      if (isFunction(props.className)) {
        const { row, rowIndex, columnIndex } = event;
        return appendDefaultClassName(
          props.className({
            row,
            rowIndex,
            columnIndex,
            origin: event
          })
        );
      }
      return appendDefaultClassName(props.className);
    };

    const headerClassName = (event) => {
      if (isFunction(props.headerClassName)) {
        const { rowIndex, columnIndex } = event;
        return appendDefaultClassName(
          props.headerClassName({
            row: {},
            rowIndex,
            columnIndex,
            origin: event
          })
        );
      }
      return appendDefaultClassName(props.headerClassName);
    };

    const footerClassName = (event) => {
      if (isFunction(props.footerClassName)) {
        const { rowIndex, columnIndex } = event;
        return appendDefaultClassName(
          props.footerClassName({
            row: {},
            rowIndex,
            columnIndex,
            origin: event
          })
        );
      }
      return appendDefaultClassName(props.footerClassName);
    };

    const invisibleContent = (context: RowContext) => {
      let val = props.invisibleContent;
      if (val == null) {
        return false;
      }
      if (isFunction(val)) {
        val = val(context) || false;
      }
      return val || false;
    };

    const createManualEditCellForDefaultSlot = (context: VxeTableRowContext, content: VNode[] | string): VNode[] => {
      const children = [createVNode('div', { class: `${DEFAULT_CLASS_NAME}-content` }, content)];
      children.push(
        createVNode('div', { class: `${DEFAULT_CLASS_NAME}-editable-handle` }, [
          createVNode(OioIcon, {
            icon: 'oinone-chart-tree-edit',
            color: `var(--${DEFAULT_PREFIX}-default-icon-color)`,
            onClick: withModifiers(() => activeCellEditor(context), ['stop', 'prevent'])
          })
        ])
      );
      return children;
    };

    const renderDefaultSlot: VxeTableCellRenderFunction = (context) => {
      const classList = [`${DEFAULT_CLASS_NAME}-wrapper`];
      if (props.align) {
        classList.push(`${DEFAULT_CLASS_NAME}-wrapper-${props.align}`);
      }
      let wrapperChildren = props.renderDefaultSlot?.(context) || [];
      if (props.type === SEQ_TYPE) {
        if (!wrapperChildren.length) {
          wrapperChildren = [createVNode('span', {}, context.origin?.seq)];
        }
      } else if (!props.disableEditorRender && props.editable) {
        if (
          props.editorTrigger === TableEditorTrigger.manual &&
          props.editorMode === TableEditorMode.cell &&
          executeCellEditable(context, props.cellEditable)
        ) {
          wrapperChildren = createManualEditCellForDefaultSlot(context, wrapperChildren);
          classList.push(`${DEFAULT_CLASS_NAME}-manual-editor`);
        }
      }
      return [
        withDirectives(createVNode('div', { class: classList }, wrapperChildren), [[vShow, !invisibleContent(context)]])
      ];
    };

    const createManualEditCellForEditSlot = (context: VxeTableRowContext, content: VNode[] | string): VNode[] => {
      const children = [createVNode('div', { class: `${DEFAULT_CLASS_NAME}-content` }, content)];
      children.push(
        createVNode('div', { class: `${DEFAULT_CLASS_NAME}-complete-handle` }, [
          createVNode(OioIcon, {
            icon: 'oinone-lujing',
            color: 'var(--oio-default-icon-color)',
            onClick: withModifiers(() => closeCellEditorByEnter(context), ['stop', 'prevent'])
          }),
          createVNode(OioIcon, {
            icon: 'oinone-guanbi1',
            color: 'var(--oio-default-icon-color)',
            size: 10,
            onClick: withModifiers(() => closeCellEditorByCancel(context), ['stop', 'prevent'])
          })
        ])
      );
      return children;
    };

    const renderEditSlot: VxeTableCellRenderFunction = (context) => {
      const classList = [`${DEFAULT_CLASS_NAME}-wrapper`];
      let wrapperChildren = props.renderEditSlot?.(context) || [];
      if (props.type === SEQ_TYPE) {
        if (!wrapperChildren.length) {
          wrapperChildren = [createVNode('span', {}, context.origin?.seq)];
        }
      } else if (!props.disableEditorRender && props.editable) {
        if (props.editorMode === TableEditorMode.cell && props.editorCloseTrigger === TableEditorCloseTrigger.manual) {
          wrapperChildren = createManualEditCellForEditSlot(context, wrapperChildren);
          classList.push(`${DEFAULT_CLASS_NAME}-manual-editor`, `${DEFAULT_CLASS_NAME}-editing`);
        }
      }
      return [createVNode('div', { class: classList }, wrapperChildren)];
    };

    watch(
      () => props.invisible,
      () => {
        if (tableInstance) {
          debounce(() => {
            tableInstance.refreshColumn();
          }, 50)();
        }
      }
    );

    return {
      width,
      minWidth,
      fixed,

      className,
      headerClassName,
      footerClassName,

      renderDefaultSlot,
      renderEditSlot
    };
  },
  render() {
    const {
      $attrs,
      $slots,

      type,
      label,
      headerAlign,
      footerAlign,
      width,
      minWidth,
      fixed,
      field,
      sortable,
      invisible,
      editable,
      className,
      headerClassName,
      footerClassName,

      componentData
    } = this;
    const children: Record<string, Slot> = {};
    Object.entries(renderMethods).forEach(([slotName, method]) => {
      const fn = (this[method] || $slots[slotName]) as CellRenderFunction;
      if (fn) {
        children[slotName] = (context: RenderRowContext) => renderMethodExecutor(context, fn);
      }
    });
    return createVNode(
      Column,
      {
        ...PropRecordHelper.collectionBasicProps($attrs),
        ...(componentData || {}),

        type,
        title: label,
        headerAlign,
        footerAlign,
        width,
        minWidth,
        fixed,
        field,
        sortable: false,
        visible: !invisible,
        editRender: { enabled: editable },
        className,
        headerClassName,
        footerClassName
      },
      children
    );
  }
});
</script>
