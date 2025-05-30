<script lang="ts">
import {
  getVNodeKey,
  OioTabProps,
  PropRecordHelper,
  TabHTMLNode,
  useInjectOioTabsContext,
  useOioFormLayoutContext
} from '@kunlun/vue-ui-common';
import { TabPane as ATabPane } from 'ant-design-vue';
import { createVNode, defineComponent, onUpdated, watch } from 'vue';
import { onTabInvisibleChange } from './use-tab-bar';

export default defineComponent({
  name: 'OioTab',
  components: {
    ATabPane
  },
  inheritAttrs: false,
  props: {
    ...OioTabProps
  },
  slots: ['default', 'tab'],
  setup(props) {
    useOioFormLayoutContext(props);

    const tabKey = getVNodeKey();

    const tabsContext = useInjectOioTabsContext();

    const onInvisibleChange = (nodes: TabHTMLNode[], moreNodes: TabHTMLNode[], invisible: boolean | undefined) => {
      if (!tabKey) {
        return;
      }
      const index = nodes.findIndex((tab) => tab.key === tabKey);
      if (index == null || index === -1) {
        return;
      }
      onTabInvisibleChange(nodes, index, invisible);
      const targetId = `${tabsContext.id.value}-more-popup-${tabKey}`;
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
        ...PropRecordHelper.collectionBasicProps(this.$attrs),
        ...(this.componentData || {}),
        ...this.$attrs,
        forceRender: this.forceRender,
        disabled: this.disabled
      },
      {
        default: () => {
          return [
            createVNode('div', { class: 'oio-tab' }, [
              createVNode(
                'div',
                { class: ['oio-tab-content', `oio-tab-${this.tabPosition}-content`] },
                { default: () => slots.default() }
              )
            ])
          ];
        }
      }
    );
  }
});
</script>
