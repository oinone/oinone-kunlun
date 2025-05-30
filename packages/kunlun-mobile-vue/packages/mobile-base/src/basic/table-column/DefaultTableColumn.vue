<script lang="ts">
import {
  OioColumn,
  OioColumnAppearanceProps,
  OioColumnEditorProps,
  OioColumnRenderFunctionProps,
  RowContext
} from '../../ui';
import { computed, createVNode, defineComponent, PropType } from 'vue';
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
    }
  },
  setup(props) {
    const fixed = computed(() => {
      if (props.existExpandRow) {
        return undefined;
      }
      return props.fixed;
    });

    return {
      fixed
    };
  },
  render() {
    const {
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
      editable,
      editorTrigger,
      editorMode,
      editorCloseTrigger,
      rowEditorClosedByEnter,
      rowEditorClosedByCancel,
      className,
      headerClassName,
      renderDefaultSlot,
      renderEditSlot,
      renderContentSlot
    } = this;
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
      sortable,
      invisible,
      invisibleContent,
      editable,
      editorTrigger,
      editorMode,
      editorCloseTrigger,
      rowEditorClosedByEnter,
      rowEditorClosedByCancel,
      className,
      headerClassName,
      renderDefaultSlot,
      renderEditSlot,
      renderContentSlot
    });
  }
});
</script>
