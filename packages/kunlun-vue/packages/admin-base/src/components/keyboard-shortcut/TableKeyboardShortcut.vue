<script lang="ts">
import { createVNode, defineComponent, ref } from 'vue';
import { Popover as APopover } from 'ant-design-vue';
import { OioButton, ButtonType, OioRow, OioCol } from '@oinone/kunlun-vue-ui-antd';
import { menuItems } from '../../typing';

const RenderKeyboardShortcutHeader = () => {
  return createVNode(OioRow, {
    class: 'shortcut-header',
  }, [
    createVNode(OioCol, { span: 12 }, [
      createVNode('span', { class: 'shortcut-header-title' }, '操作')
    ]),
    createVNode(OioCol, { span: 12 }, [
      createVNode('span', { class: 'shortcut-header-title' }, '快捷键')
    ])
  ])
}

const RenderKeyboardShortcutInfo = () => {
  return [
    ...menuItems.map(item =>
      createVNode(OioRow, { class: 'shortcut-item' }, [
        createVNode(OioCol, { span: 12 }, [
          createVNode('span', { icon: item.icon, class: 'shortcut-item-title' }, item.label)
        ]),
        createVNode(OioCol, { span: 12 }, [
            createVNode('span', { class: 'shortcut-key' }, [
            item.shift ? 'Shift + ' : '',
            item.ctrl ? 'Ctrl + ' : '',
            item.keyCode
          ])
        ])
      ])
    )
  ]
};

export default defineComponent({
  setup(props, ctx) {
    const visible = ref(false);
    const onUpdateVisible = (val: boolean) => {
      visible.value = val;
    };
    return { visible, onUpdateVisible };
  },
  render(){
    const { visible, onUpdateVisible } = this;
    return (
    createVNode('div', { class: 'table-key-board-shortcut' }, [
      createVNode(
        APopover,
        {
          trigger: 'click',
          placement: 'bottomRight',
          visible,
          'onUpdate:visible': onUpdateVisible
        },
        {
          default: () => [
            createVNode(OioButton, {
              type: ButtonType.link,
              icon: 'oinone-biaotoushezhi',
              style: 'font-size: 16px; margin-right: 8px; cursor: pointer;'
            })
          ],
          content: () => [
            createVNode('div', { class: 'table-keyboard-shortcut-inner' }, [
              createVNode(
                RenderKeyboardShortcutHeader,
              ),
              createVNode(
                RenderKeyboardShortcutInfo,
              )
            ])
          ]
        }
      )
    ])
  );
  }
})
</script>
<style lang="scss">
.table-keyboard-shortcut-inner{
  width: 200px;
  .shortcut-item{
    margin-bottom:8px;
    .shortcut-item-title,
    .shortcut-key{
      font-size:12px;
    }
  }
  .shortcut-header{
    margin-bottom: 8px;
    border-radius: 1px solid #f0f0f0;
    .shortcut-header-title{
      font-size: 14px;
      font-weight: bold;
    }
  }
}
</style>
