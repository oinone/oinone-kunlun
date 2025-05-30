<script lang="ts">
import { DslDefinition } from '@kunlun/dsl';
import { onTabInvisibleChange, useOioFormLayoutContext } from '@kunlun/vue-ui-antd';
import { OioTabProps, PropRecordHelper, TabHTMLNode, useInjectOioTabsContext } from '@kunlun/vue-ui-common';
import { TabPane as ATabPane } from 'ant-design-vue';
import { createVNode, defineComponent, getCurrentInstance, onUpdated, PropType, watch } from 'vue';

export default defineComponent({
  name: 'DefaultMultiViewTab',
  components: {
    ATabPane
  },
  inheritAttrs: false,
  props: {
    ...OioTabProps,
    currentHandle: {
      type: String
    },
    template: {
      type: Object as PropType<DslDefinition>
    },
    subIndex: {
      type: Number
    }
  },
  slots: ['default', 'tab'],
  setup(props) {
    useOioFormLayoutContext(props);
    const tabsContext = useInjectOioTabsContext();

    const onInvisibleChange = (nodes: TabHTMLNode[], moreNodes: TabHTMLNode[], invisible: boolean | undefined) => {
      const subIndex = props.subIndex;
      if (subIndex == null) {
        return;
      }
      onTabInvisibleChange(nodes, subIndex, invisible);
      const targetId = `${tabsContext.id.value}-more-popup-${props.currentHandle}`;
      const targetIndex = moreNodes.findIndex((v) => v.el.id === targetId);
      if (targetIndex !== -1) {
        onTabInvisibleChange(moreNodes, targetIndex, invisible);
      }
    };

    watch(
      () => ({
        value: props.invisible,
        nodes: tabsContext.nodes.value,
        moreNodes: tabsContext.moreNodes.value
      }),
      (val) => {
        onInvisibleChange(val.nodes, val.moreNodes, val.value);
      },
      { immediate: true }
    );

    onUpdated(() => {
      onInvisibleChange(tabsContext.nodes.value, tabsContext.moreNodes.value, props.invisible);
    });

    return {
      tabPosition: tabsContext.tabPosition
    };
  },
  render() {
    const slots = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      }
    ]);
    return createVNode(
      ATabPane,
      {
        ...(getCurrentInstance()?.parent?.attrs || {}),
        forceRender: this.forceRender,
        disabled: this.disabled
      },
      {
        default: () => {
          return [
            createVNode('div', { class: 'oio-tab' }, [
              createVNode('div', { class: ['oio-tab-content', `oio-tab-${this.tabPosition}-content`] }, slots)
            ])
          ];
        }
      }
    );
  }
});
</script>
