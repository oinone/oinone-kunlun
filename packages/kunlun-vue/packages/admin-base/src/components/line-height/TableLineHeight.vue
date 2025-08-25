<script lang="ts">
import { createVNode, defineComponent, PropType, ref, watch } from 'vue';
import { Popover as APopover, Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue';
import { OioButton, ButtonType, OioIcon } from '@oinone/kunlun-vue-ui-antd';
import { TableLineHeightType } from '../../typing';

export default defineComponent({
  props: {
    value: {
      type: String as PropType<TableLineHeightType>,
      default: TableLineHeightType.default
    },
    onLineHeightTypeChange: {
      type: Function as PropType<(value: TableLineHeightType) => void>,
      default: () => {}
    }
  },
  setup(props, ctx) {
    const visible = ref(false);
    const selectedKeys = ref<string[]>([props.value]);

    watch(
      () => props.value,
      (newValue) => {
        selectedKeys.value = [newValue];
      }
    );

    const onUpdateVisible = (val: boolean) => {
      visible.value = val;
    };
    const onUpdateSelectedKeys = (keys: string[]) => {
      props.onLineHeightTypeChange(keys[0] as TableLineHeightType);
    };

    const menuItems = ref([
      { label: '默认', key: 'default', icon: createVNode(OioIcon, { icon: 'oinone-yidong' }) },
      { label: '低', key: 'small', icon: createVNode(OioIcon, { icon: 'oinone-yidong' }) },
      { label: '中', key: 'middle', icon: createVNode(OioIcon, { icon: 'oinone-yidong' }) },
      { label: '高', key: 'large', icon: createVNode(OioIcon, { icon: 'oinone-yidong' }) },
      { label: '自适应', key: 'auto', icon: createVNode(OioIcon, { icon: 'oinone-yidong' }) }
    ]);
    return {
      visible,
      onUpdateVisible,
      selectedKeys,
      onUpdateSelectedKeys,
      menuItems
    };
  },
  render() {
    const { visible, onUpdateVisible, selectedKeys, onUpdateSelectedKeys, menuItems } = this;
    return createVNode('div', { class: 'table-row-height' }, [
      createVNode(
        APopover,
        {
          trigger: 'click',
          placement: 'bottomRight',
          visible,
          'onUpdate:visible': onUpdateVisible
        },
        {
          content: () => [
            createVNode('div', { class: 'table-row-height-inner' }, [
              createVNode(
                AMenu,
                {
                  multiple: false,
                  selectedKeys,
                  'onUpdate:selectedKeys': onUpdateSelectedKeys,
                  defaultValue: [this.value]
                },
                menuItems.map((item) => createVNode(AMenuItem, { key: item.key, icon: item.icon }, () => item.label))
              )
            ])
          ],
          default: () =>
            createVNode(OioButton, {
              type: ButtonType.link,
              icon: 'oinone-biaotoushezhi',
              style: 'font-size: 16px; margin-right: 8px; cursor: pointer;'
            })
        }
      )
    ]);
  }
});
</script>
<style lang="scss">
.table-row-height-inner {
  .ant-menu {
    border-right: none;
  }
}
</style>
