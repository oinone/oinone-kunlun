<script lang="ts">
import { createVNode, defineComponent } from 'vue';
import { TableSortField, TableLineHeight, TableFullScreen, TableKeyboardShortcut } from '../../components';

export default defineComponent({
  name: 'TableControlIcon',
  props: [
    'sortList',
    'allFields',
    'onSortChange',
    'lineHeightType',
    'onLineHeightTypeChange',
    'fullScreen',
    'switchFullScreen'
  ],
  // inheritAttrs: false,
  setup(props) {
    return {};
  },
  render() {
    return createVNode(
      'div',
      {
        class: 'table-control-icon'
      },
      [
        createVNode('div', { class: 'table-control-icon-inner' }, [
          createVNode(TableSortField, {
            fields: this.sortList,
            onSortChange: this.onSortChange
          }),
          createVNode(TableLineHeight, {
            value: this.lineHeightType,
            onLineHeightTypeChange: this.onLineHeightTypeChange
          }),
          createVNode(TableFullScreen, {
            value: this.fullScreen,
            onChange: this.switchFullScreen,
          }),
          createVNode(TableKeyboardShortcut )
        ])
      ]
    );
  }
});
</script>

<style scoped>
.table-control-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  background-color: red;
  top: 0px;
  left: 0px;
}
.table-control-icon-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
