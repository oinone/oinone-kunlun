<script lang="ts">
import { OioTable } from '@oinone/kunlun-vue-ui';
import { createVNode, defineComponent, VNode } from 'vue';
import { JsonTableFactory } from './jsonTableFactory';

export default defineComponent({
  name: 'JsonTable',
  components: { OioTable },
  props: {
    tableDataSource: {
      type: Array
    },
    colKeys: {
      type: Array
    }
  },
  setup(props, context) {},
  render(props) {
    const { $attrs } = this;
    const { colKeys } = props;
    const tableSlot: VNode[] = [];
    if (colKeys) {
      for (const colKey of colKeys) {
        const com = JsonTableFactory.selectTableCol(colKey);
        if (com) {
          tableSlot.push(
            createVNode(com, {
              ...props,
              ...$attrs
            })
          );
        }
      }
    }
    return createVNode(
      OioTable,
      {
        ...props,
        data: props.tableDataSource
      },
      {
        default: () => {
          return tableSlot;
        }
      }
    );
  }
});
</script>

<style lang="scss"></style>
