<script lang="ts">
import { DslDefinition, DslDefinitionType } from '@kunlun/dsl';
import { DEFAULT_PREFIX, useTabBar } from '@kunlun/vue-ui-mobile-vant';
import {
  DEFAULT_TAB_TITLE,
  OioTabProps,
  PropRecordHelper,
  useInjectOioFormContext,
  useInjectOioTabsContext,
  useProviderOioFormContext
} from '@kunlun/vue-ui-common';
import { DslRender } from '@kunlun/vue-widget';
import { Tab as VanTab } from 'vant';
import { computed, createVNode, defineComponent, getCurrentInstance, PropType } from 'vue';
import { InternalWidget, ResolveMode } from '../../tags/resolve/typing';

export default defineComponent({
  name: 'DefaultTab',
  components: {
    VanTab
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
    },
    title: {
      type: String,
      default: DEFAULT_TAB_TITLE
    }
  },
  slots: ['default'],
  setup(props) {
    const formContext = useInjectOioFormContext();
    const tabsContext = useInjectOioTabsContext();

    const layout = computed(() => {
      return props.layout || formContext.layout.value;
    });

    useProviderOioFormContext({
      ...formContext,
      layout
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
      VanTab,
      {
        ...(getCurrentInstance()?.parent?.attrs || {}),
        name: this.currentHandle,
        // invisible属性会触发该组件的死循环渲染，所以先注释掉，通过在title的slot处理标题的隐藏
        // titleClass: [this.invisible && `${DEFAULT_PREFIX}-tab-bar-invisible`],
        forceRender: this.forceRender,
        disabled: this.disabled
      },
      {
        title: () => [useTabBar(this.title, this.invisible!)],
        default: () => {
          return [
            createVNode('div', { class: `${DEFAULT_PREFIX}-tab` }, [
              createVNode(
                'div',
                { class: [`${DEFAULT_PREFIX}-tab-content`, `${DEFAULT_PREFIX}-tab-${this.tabPosition}-content`] },
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
