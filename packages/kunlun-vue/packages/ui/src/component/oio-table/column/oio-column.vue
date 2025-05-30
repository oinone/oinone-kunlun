<script lang="ts">
import { StringHelper } from '@kunlun/shared';
import { OioPopconfirm } from '@kunlun/vue-ui-antd';
import { OioIcon, PropRecordHelper, StyleHelper } from '@kunlun/vue-ui-common';
import { debounce, isBoolean, isFunction, isNil, isString, toString } from 'lodash-es';
import { computed, createVNode, defineComponent, Slot, VNode, vShow, watch, withDirectives, withModifiers } from 'vue';
import { Column } from 'vxe-table';
import { DEFAULT_PREFIX } from '../../../theme';
import { useInjectOioTableInstance } from '../context';
import { TableEditorCloseTrigger, TableEditorMode, TableEditorTrigger } from '../table';
import { CellRenderFunction, RowContext, VxeTableCellRenderFunction, VxeTableRowContext } from '../typing';
import { OioColumnProps } from './props';
import { RenderRowContext } from './typing';

const DEFAULT_CLASS_NAME = `${DEFAULT_PREFIX}-column`;

const renderMethods = {
  default: 'renderDefaultSlot',
  edit: 'renderEditSlot',
  content: 'renderContentSlot',
  header: 'renderHeaderSlot'
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

function appendDefaultClassName(classList: string | string[] | undefined, classNames?: string | string[]) {
  return StringHelper.append([DEFAULT_CLASS_NAME], classList, classNames);
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

function propGetter<R, T extends R | ((ctx: VxeTableRowContext) => R)>(
  context: VxeTableRowContext,
  fn: T | undefined
): R | undefined {
  if (fn == null) {
    return fn as R;
  }
  if (isFunction(fn)) {
    return fn(context);
  }
  return fn as R;
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
  setup(props, context) {
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

    const activeCellEditor = (ctx: VxeTableRowContext) => {
      const { origin } = ctx;
      tableInstance?.activeCellEditor(origin.row, origin.column);
    };

    const closeCellEditorByEnter = async (ctx: VxeTableRowContext) => {
      let res = await props.rowEditorClosedByEnter?.(ctx);
      if (res == null) {
        res = true;
      }
      if (res) {
        tableInstance?.clearEditor();
      }
    };

    const closeCellEditorByCancel = async (ctx: VxeTableRowContext) => {
      let res = await props.rowEditorClosedByCancel?.(ctx);
      if (res == null) {
        res = true;
      }
      if (res) {
        tableInstance?.clearEditor();
      }
    };

    const className = (event) => {
      const classNames = [] as string[];
      if (!isNil(props.width) && parseInt(toString(props.width)) <= 0) {
        classNames.push(`${DEFAULT_CLASS_NAME}-overflow-hidden`);
      }
      if (props.align) {
        classNames.push(`col--${props.align}`);
      }
      if (isFunction(props.className)) {
        const { row, rowIndex, columnIndex } = event;
        return appendDefaultClassName(
          props.className({
            row,
            rowIndex,
            columnIndex,
            origin: event
          }),
          classNames
        );
      }
      return appendDefaultClassName(props.className, classNames);
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

    const invisibleContent = (ctx: RowContext) => {
      let val = props.invisibleContent;
      if (val == null) {
        return false;
      }
      if (isFunction(val)) {
        val = val(ctx) || false;
      }
      return val || false;
    };

    const createManualEditCellForDefaultSlot = (ctx: VxeTableRowContext, content: VNode[] | string): VNode[] => {
      const children = [createVNode('div', { class: `${DEFAULT_CLASS_NAME}-content` }, content)];
      children.push(
        createVNode('div', { class: `${DEFAULT_CLASS_NAME}-editable-handle` }, [
          createVNode(OioIcon, {
            icon: 'oinone-chart-tree-edit',
            color: 'var(--oio-default-icon-color)',
            onClick: withModifiers(() => activeCellEditor(ctx), ['stop', 'prevent'])
          })
        ])
      );
      return children;
    };

    let renderDefaultSlot: VxeTableCellRenderFunction | undefined;
    const defaultSlotFn = props.renderDefaultSlot || context.slots.default;
    if (defaultSlotFn) {
      renderDefaultSlot = (ctx) => {
        const classList = [`${DEFAULT_CLASS_NAME}-wrapper`];
        // if (props.align) {
        //   classList.push(`${DEFAULT_CLASS_NAME}-wrapper-${props.align}`);
        // }
        let wrapperChildren = defaultSlotFn(ctx) || [];
        if (props.type === SEQ_TYPE) {
          if (!wrapperChildren.length) {
            wrapperChildren = [createVNode('span', {}, ctx.origin?.seq)];
          }
        } else if (!props.disableEditorRender && props.editable) {
          if (
            props.editorTrigger === TableEditorTrigger.manual &&
            props.editorMode === TableEditorMode.cell &&
            executeCellEditable(ctx, props.cellEditable)
          ) {
            wrapperChildren = createManualEditCellForDefaultSlot(ctx, wrapperChildren);
            classList.push(`${DEFAULT_CLASS_NAME}-manual-editor`);
          }
        }
        if (!wrapperChildren || !wrapperChildren.length) {
          classList.push(`${DEFAULT_CLASS_NAME}-wrapper-empty`);
        }
        return [
          withDirectives(createVNode('div', { class: classList }, wrapperChildren), [[vShow, !invisibleContent(ctx)]])
        ];
      };
    }

    const editorConfirmPosition = (ctx: VxeTableRowContext): string | undefined => {
      if (!props.editorConfirm) {
        return undefined;
      }
      return propGetter(ctx, props.editorConfirmPosition);
    };

    const editorConfirm = (ctx: VxeTableRowContext): string | undefined => {
      if (!props.editorConfirm) {
        return undefined;
      }
      return propGetter(ctx, props.editorConfirm);
    };

    const editorEnterText = (ctx: VxeTableRowContext): string | undefined => {
      if (!props.editorConfirm) {
        return undefined;
      }
      return propGetter(ctx, props.editorEnterText);
    };

    const editorCancelText = (ctx: VxeTableRowContext): string | undefined => {
      if (!props.editorConfirm) {
        return undefined;
      }
      return propGetter(ctx, props.editorCancelText);
    };

    const editorCondition = async (ctx: VxeTableRowContext): Promise<boolean | undefined> => {
      if (!props.editorConfirm) {
        return false;
      }
      return props.editorCondition?.(ctx);
    };

    const createManualEditCellForEditSlot = (ctx: VxeTableRowContext, content: VNode[] | string): VNode[] => {
      const children = [createVNode('div', { class: `${DEFAULT_CLASS_NAME}-content` }, content)];
      children.push(
        createVNode('div', { class: `${DEFAULT_CLASS_NAME}-complete-handle` }, [
          createVNode(
            OioPopconfirm,
            {
              placement: editorConfirmPosition(ctx),
              text: editorConfirm(ctx),
              enterText: editorEnterText(ctx),
              cancelText: editorCancelText(ctx),
              condition: () => editorCondition(ctx),
              confirmCallback: () => closeCellEditorByEnter(ctx)
            },
            {
              default: () => {
                return [
                  createVNode(OioIcon, {
                    icon: 'oinone-lujing',
                    color: 'var(--oio-default-icon-color)'
                  })
                ];
              }
            }
          ),
          createVNode(OioIcon, {
            icon: 'oinone-guanbi1',
            color: 'var(--oio-default-icon-color)',
            size: 10,
            onClick: withModifiers(() => closeCellEditorByCancel(ctx), ['stop', 'prevent'])
          })
        ])
      );
      return children;
    };

    let renderEditSlot: VxeTableCellRenderFunction | undefined;
    const editSlotFn = props.renderEditSlot || context.slots.edit;
    if (editSlotFn) {
      renderEditSlot = (ctx) => {
        const classList = [`${DEFAULT_CLASS_NAME}-wrapper`];
        let wrapperChildren = editSlotFn(ctx) || [];
        if (props.type === SEQ_TYPE) {
          if (!wrapperChildren.length) {
            wrapperChildren = [createVNode('span', {}, ctx.origin?.seq)];
          }
        } else if (!props.disableEditorRender && props.editable) {
          if (
            props.editorMode === TableEditorMode.cell &&
            props.editorCloseTrigger === TableEditorCloseTrigger.manual
          ) {
            wrapperChildren = createManualEditCellForEditSlot(ctx, wrapperChildren);
            classList.push(`${DEFAULT_CLASS_NAME}-manual-editor`, `${DEFAULT_CLASS_NAME}-editing`);
          }
        }
        return [createVNode('div', { class: classList }, wrapperChildren)];
      };
    }

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
      resizable,
      treeNode,

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
        sortable,
        visible: !invisible,
        resizable,
        treeNode,

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
