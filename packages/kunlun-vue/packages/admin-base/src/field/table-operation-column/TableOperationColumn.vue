<script lang="ts">
import { translate, translateValueByKey } from '@oinone/kunlun-engine';
import { RenderRowContext, useInjectOioTableInstance } from '@oinone/kunlun-vue-ui';
import { StableSlotProp, StyleHelper } from '@oinone/kunlun-vue-ui-common';
import { debounce, isBoolean } from 'lodash-es';
import { computed, createVNode, defineComponent, PropType } from 'vue';
import { Column } from 'vxe-table';
import { RowActionBarWidget } from '../../action/component/action-bar/RowActionBarWidget';
import { Element } from '../../tags';
import ActionBar from '../../tags/ActionBar.vue';
import { OperationColumnDirection } from '../../typing';

export default defineComponent({
  name: 'TableOperationColumn',
  components: {
    ActionBar,
    Column
  },
  props: {
    currentHandle: {
      type: String
    },
    title: {
      type: String,
      default: '操作'
    },
    width: {
      type: [String, Number]
    },
    minWidth: {
      type: [String, Number]
    },
    fixed: {
      type: [String, Boolean],
      default: 'right'
    },
    direction: {
      type: String as PropType<OperationColumnDirection>
    },
    invisible: {
      type: Boolean,
      default: false
    },
    existExpandRow: {
      type: Boolean
    },
    itemData: {
      type: String
    },
    headerClassName: {
      type: Function
    }
  },
  setup(props) {
    const table = useInjectOioTableInstance();
    const realWidth = computed(() => StyleHelper.px(props.width));
    const realMinWidth = computed(() => StyleHelper.px(props.minWidth));

    const fixed = computed(() => {
      if (props.existExpandRow || isBoolean(props.fixed)) {
        return undefined;
      }
      return props.fixed;
    });

    const direction = computed(() => props.direction?.toLowerCase?.() || OperationColumnDirection.horizontal);

    const isLastColumn = computed(() => {
      const tableInstance = table?.getOrigin();
      const columns = tableInstance?.getColumns().filter((a) => a.visible);
      return columns && columns[columns.length - 1].field === props.itemData;
    });

    return {
      realWidth,
      realMinWidth,
      fixed,
      direction,
      translate,
      table,
      isLastColumn
    };
  },
  render() {
    const {
      itemData,
      fixed,
      title,
      realWidth,
      realMinWidth,
      headerClassName,
      direction,
      invisible,
      currentHandle,
      table,
      isLastColumn
    } = this;
    const userPreferNodes = isLastColumn
      ? [
          createVNode(Element, {
            widget: 'user-prefer',
            subPath: 'user-prefer',
            dslDefinition: { simple: (table?.getOrigin().props?.customConfig as any)?.usingSimpleUserPrefer }
          })
        ]
      : [];
    const column = createVNode(
      Column,
      {
        className: `operation-column operation-column-${direction}`,
        field: itemData,
        fixed,
        title: translateValueByKey(title),
        width: realWidth,
        minWidth: realMinWidth,
        sortable: false,
        headerClassName,
        visible: !invisible
      },
      {
        default: (context: RenderRowContext) => {
          return createVNode(
            ActionBar,
            {
              widget: 'rowAction',
              parentHandle: currentHandle,
              inline: true,
              activeRecords: context.row,
              rowIndex: context.rowIndex,
              key: context.rowIndex,
              refreshWidgetRecord: debounce((widget?: RowActionBarWidget) => {
                if (widget) {
                  widget.setCurrentActiveRecords(context.row);
                }
              })
            },
            {
              default: () => this.$slots.default?.() || [],
              ...StableSlotProp
            }
          );
        },
        header: () => {
          return [
            createVNode('div', { class: 'table-operation-wrapper' }, [
              createVNode('span', {}, translateValueByKey('操作'))
            ]),
            ...userPreferNodes
          ];
        }
      }
    );
    return column;
  }
});
</script>
<style lang="scss">
.table-header-column-operation {
  & > .vxe-cell > .vxe-cell--title {
    width: 100%;
  }
}

.table-operation-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
