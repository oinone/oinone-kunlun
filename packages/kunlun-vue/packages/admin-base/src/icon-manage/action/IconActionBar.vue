<script lang="ts">
import { OioIcon, PropRecordHelper } from '@kunlun/vue-ui-antd';
import { createVNode, defineComponent, withDirectives, vShow } from 'vue';

export default defineComponent({
  name: 'IconActionBar',
  components: {
    OioIcon
  },
  inheritAttrs: false,
  props: {
    activeRecords: {
      type: Object
    },
    rowIndex: {
      type: Number
    }
  },
  setup() {},
  render() {
    const defaultChildren = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      }
    ]).default();
    const { activeRecords } = this;
    if (!activeRecords) return;
    const activeRecord = activeRecords[0];
    const actions = createVNode(
      'div',
      {
        class: 'default-iconCard-actions'
      },
      [
        createVNode('div', { class: 'default-iconCard-action' }, [
          defaultChildren[0],
          createVNode(OioIcon, { icon: 'oinone-bianji4', size: 24 })
        ]),
        createVNode('div', { class: 'default-iconCard-action' }, [
          withDirectives(defaultChildren[3], [[vShow, activeRecord.show]]),
          withDirectives(
            createVNode(OioIcon, {
              icon: 'oinone-xianshi',
              size: 20
            }),
            [[vShow, activeRecord.show]]
          ),
          withDirectives(defaultChildren[2], [[vShow, !activeRecord.show]]),
          withDirectives(
            createVNode(OioIcon, {
              icon: 'oinone-invisible',
              size: 20
            }),
            [[vShow, !activeRecord.show]]
          )
        ]),
        createVNode('div', { class: 'default-iconCard-action' }, [
          defaultChildren[1],
          createVNode(OioIcon, {
            icon: 'oinone-shanchu',
            size: 20
          })
        ])
        // 点击引用按钮页面无翻译，建议先隐藏此操作
        // createVNode('div', { class: 'default-iconCard-action' }, [
        //   createVNode(OioIcon, {
        //     icon: 'oinone-fuzhi1',
        //     size: 20,
        //     onClick: () => {
        //       const eInput = document.createElement('input');
        //       eInput.value = activeRecord.fullFontClass;
        //       document.body.appendChild(eInput);
        //       eInput.select(); // 选择对象
        //       const copied = document.execCommand('Copy');
        //       eInput.style.display = 'none';
        //       document.body.removeChild(eInput);

        //       if (!copied) {
        //         throw new Error('copy font class failed');
        //       }
        //     }
        //   })
        // ])
      ]
    );

    return actions;
  }
});
</script>
