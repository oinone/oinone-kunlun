<script lang="ts">
import { DslDefinition, DslDefinitionType } from '@oinone/kunlun-dsl';
import { onTabInvisibleChange, useOioFormLayoutContext } from '@oinone/kunlun-vue-ui-antd';
import { OioTabProps, PropRecordHelper, TabHTMLNode, useInjectOioTabsContext } from '@oinone/kunlun-vue-ui-common';
import { DslRender } from '@oinone/kunlun-vue-widget';
import { TabPane as ATabPane } from 'ant-design-vue';
import { createVNode, defineComponent, getCurrentInstance, onUpdated, PropType, watch } from 'vue';
import { InternalWidget, ResolveMode } from '../../tags/resolve/typing';

export default defineComponent({
  name: 'DefaultTab',
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
              createVNode(
                'div',
                { class: ['oio-tab-content', `oio-tab-${this.tabPosition}-content`] },
                {
                  default: () => [
                    DslRender.render({
                      ...(this.template || {}),
                      dslNodeType: DslDefinitionType.PACK,
                      widgets: [],
                      widget: InternalWidget.Row,
                      parentHandle: this.currentHandle,
                      resolveOptions: {
                        mode: ResolveMode.NORMAL
                      },
                      __index: 0,
                      __slots: {
                        default: () => slots.default()
                      }
                    })
                  ]
                }
              )
            ])
          ];
        }
      }
    );
  }
});
</script>
