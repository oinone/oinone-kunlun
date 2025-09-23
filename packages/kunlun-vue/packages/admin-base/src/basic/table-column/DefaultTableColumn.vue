<script lang="ts">
import { DslDefinition } from '@oinone/kunlun-dsl';
import {
  GROUP_TREE_KEY,
  OioColumn,
  OioColumnAppearanceProps,
  OioColumnEditorProps,
  OioColumnRenderFunctionProps,
  OioTableInstance,
  RowContext,
  TableEditorMode,
  useInjectOioTableInstance,
  VxeTableRowContext
} from '@oinone/kunlun-vue-ui';
import { computed, createVNode, defineComponent, onMounted, PropType, VNode } from 'vue';
import { ManualWidget } from '../mixin';

export default defineComponent({
  name: 'DefaultTableColumn',
  mixins: [ManualWidget],
  components: {
    OioColumn
  },
  inheritAttrs: false,
  props: {
    ...OioColumnAppearanceProps,
    ...OioColumnEditorProps,
    ...OioColumnRenderFunctionProps,
    currentHandle: {
      type: String
    },
    template: {
      type: Object as PropType<DslDefinition>
    },
    setTableInstance: {
      type: Function as PropType<(tableInstance: OioTableInstance | undefined) => void>
    },
    columnType: {
      type: String
    },
    itemData: {
      type: String
    },
    sortable: {
      type: Boolean,
      default: false
    },
    invisible: {
      type: Boolean,
      default: false
    },
    invisibleContent: {
      type: [Boolean, Function] as PropType<boolean | ((context: RowContext) => boolean)>,
      default: undefined
    },
    existExpandRow: {
      type: Boolean
    },
    enabledGroupView: {
      type: Boolean
    },
    groupable: {
      type: Boolean
    },
    tableExpandTreeFieldColumn: {
      type: String
    },
    treeNode: {
      type: Boolean,
      default: undefined
    },
    wrapperToFieldAction: {
      type: Function as PropType<(vNodes: VNode[] | string, context: RowContext) => VNode[] | string>
    }
  },
  setup(props) {
    const table = useInjectOioTableInstance();

    const fixed = computed(() => {
      if (props.existExpandRow) {
        return undefined;
      }
      return props.fixed;
    });

    const defaultRenderHeaderSlot = (context: RowContext): VNode[] | string => {
      return [createVNode('span', { class: 'oio-column-header-title' }, props.label)];
    };

    const renderDefaultSlot = (context: VxeTableRowContext) => {
      /**
       * 当前视图启动了分组 & 当前字段允许分许 & 当前是展开行 & 当前单元格不是展开字段
       * 则渲染分组单元格
       */
      if (props.enabledGroupView && props.groupable && context.data[GROUP_TREE_KEY.CHILDREN_KEY]) {
        // 非展开行字段
        if (context.origin?.column?.field !== props.tableExpandTreeFieldColumn) {
          return props.renderGroupCellSlot?.(context);
        }

        // 展开行字段
        return [
          createVNode('span', { class: 'default-group-compose-cell' }, [
            createVNode('span', { class: 'default-group-compose-cell-content' }, [props.renderDefaultSlot?.(context)]),
            props.renderGroupCellSlot?.(context)
          ])
        ];
      }

      if (props.editorMode === TableEditorMode.table && props.editable) {
        return props.renderEditSlot?.(context);
      }

      const vNodes = props.renderDefaultSlot?.(context);
      if (vNodes == null) {
        return [];
      }
      return props.wrapperToFieldAction?.(vNodes, context);
    };

    onMounted(() => {
      props.setTableInstance?.(table);
    });

    return {
      fixed,
      defaultRenderHeaderSlot,
      renderDefaultSlot
    };
  },
  render() {
    const {
      currentHandle,
      template,
      columnType,
      label,
      align,
      headerAlign,
      footerAlign,
      width,
      minWidth,
      fixed,
      itemData,
      sortable,
      invisible,
      invisibleContent,
      treeNode,
      resizable,
      editable,
      cellEditable,
      editorTrigger,
      editorMode,
      editorCloseTrigger,
      rowEditorClosedByEnter,
      rowEditorClosedByCancel,
      editorConfirm,
      editorConfirmPosition,
      editorCondition,
      editorEnterText,
      editorCancelText,
      className,
      headerClassName,
      renderDefaultSlot,
      renderEditSlot,
      renderContentSlot,
      renderHeaderSlot,

      defaultRenderHeaderSlot
    } = this;

    let finalRenderHeaderSlot: Function | undefined = renderHeaderSlot || defaultRenderHeaderSlot;
    let finalRenderDefaultSlot: Function | undefined = renderDefaultSlot;
    if (columnType === 'checkbox' || columnType === 'radio') {
      finalRenderHeaderSlot = undefined;
      finalRenderDefaultSlot = undefined;
    }

    const isEditTable = editorMode === TableEditorMode.table;
    return createVNode(OioColumn, {
      type: columnType,
      label,
      align,
      headerAlign,
      footerAlign,
      width,
      minWidth,
      fixed,
      field: itemData,
      resizable,
      treeNode,
      sortable,
      invisible,
      invisibleContent,
      editable,
      cellEditable,
      editorTrigger,
      editorMode: isEditTable ? TableEditorMode.row : editorMode,
      editorCloseTrigger,
      rowEditorClosedByEnter,
      rowEditorClosedByCancel,
      editorConfirm,
      editorConfirmPosition,
      editorCondition,
      editorEnterText,
      editorCancelText,
      className,
      headerClassName,
      renderDefaultSlot: finalRenderDefaultSlot,
      renderEditSlot,
      renderContentSlot,
      renderHeaderSlot: finalRenderHeaderSlot,
      componentData: {
        params: {
          handle: currentHandle,
          template
        }
      }
    });
  }
});
</script>
