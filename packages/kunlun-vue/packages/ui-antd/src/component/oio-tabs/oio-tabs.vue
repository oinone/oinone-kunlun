<script lang="ts">
import { BooleanHelper, CSSStyle, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import {
  CleanableEvent,
  OioTabPosition,
  OioTabsProps,
  PropRecordHelper,
  StyleHelper,
  TabHTMLNode,
  useCleanableEvent,
  useOioFormLayoutContext,
  useProviderOioTabsContext
} from '@oinone/kunlun-vue-ui-common';
import { Tabs as ATabs } from 'ant-design-vue';
import useConfigInject from 'ant-design-vue/lib/_util/hooks/useConfigInject.js';
import { isNil } from 'lodash-es';
import { computed, createVNode, defineComponent, onMounted, onUnmounted, ref, unref, vShow, withDirectives } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioTabs',
  components: {
    ATabs
  },
  inheritAttrs: false,
  props: {
    ...OioTabsProps
  },
  emits: ['update:active-key'],
  slots: ['default', 'tabBarLeftExtraContent', 'tabBarExtraContent'],
  setup(props, context) {
    useOioFormLayoutContext(props);

    const id = props.id || uniqueKeyGenerator();
    const { prefixCls } = useConfigInject('tabs', {});

    const origin = ref();
    const tabHTMLNodes = ref<TabHTMLNode[]>([]);
    const moreTabHTMLNodes = ref<TabHTMLNode[]>([]);

    const onUpdateActiveKey = (val) => {
      context.emit('update:active-key', val);
    };

    let moreButtonMousemove: CleanableEvent | undefined;

    const moreButtonChange = () => {
      const moreNodes: TabHTMLNode[] = [];
      let index = 0;
      const moreTabList = document.getElementById(`${id}-more-popup`)?.children as HTMLCollection;
      if (moreTabList) {
        for (const element of moreTabList) {
          if (element.classList.contains('ant-tabs-dropdown-menu-item')) {
            moreNodes.push({
              el: element as HTMLElement,
              index: index++
            });
          }
        }
      }
      moreTabHTMLNodes.value = moreNodes;
    };

    onMounted(() => {
      const pre = unref(prefixCls);
      const tabPrefix = `${pre}-tab`;
      const tabBarList = origin.value.$el?.children?.[0]?.children?.[0]?.children?.[0]?.children as HTMLCollection;
      const nodes: TabHTMLNode[] = [];
      let index = 0;
      if (tabBarList) {
        for (const element of tabBarList) {
          if (element.classList.contains(tabPrefix)) {
            const tabEl = element as HTMLElement;
            const tabKey = (element as any).__vnode?.props?.key;
            nodes.push({
              el: tabEl,
              key: tabKey,
              index: index++
            });
          }
        }
        tabHTMLNodes.value = nodes;
      }

      const moreButton = document.getElementById(`${id}-more`);
      if (moreButton) {
        const moreButtonExpandedListener = {
          expanded: false,
          checker: (): boolean => {
            if (!moreTabHTMLNodes.value.length) {
              return true;
            }
            const current = !!BooleanHelper.toBoolean(moreButton.getAttribute('aria-expanded'));
            if (current !== moreButtonExpandedListener.expanded) {
              moreButtonExpandedListener.expanded = current;
              return true;
            }
            return false;
          },
          listener: () => {
            if (moreButtonExpandedListener.checker()) {
              moreButtonChange();
            }
          }
        };
        moreButtonMousemove = useCleanableEvent(origin.value.$el, 'mousemove', moreButtonExpandedListener.listener);
      }
    });

    onUnmounted(() => {
      moreButtonMousemove?.remove();
    });

    useProviderOioTabsContext({
      id: computed(() => id),
      nodes: computed(() => tabHTMLNodes.value),
      moreNodes: computed(() => moreTabHTMLNodes.value),
      tabPosition: computed(() => props.tabPosition)
    });

    return {
      id,
      origin,
      onUpdateActiveKey
    };
  },
  render() {
    const {
      invisible,
      disabled,
      componentData,

      id,
      activeKey,
      tabPosition,
      verticalHeight,
      destroyInactiveTabPane,
      type
    } = this;

    const style = {} as CSSStyle;
    if (tabPosition !== OioTabPosition.TOP) {
      if (!isNil(verticalHeight)) {
        style.height = StyleHelper.px(verticalHeight) as string;
      }
    }

    const classNames = [`${DEFAULT_PREFIX}-tabs`];
    if (disabled) {
      classNames.push(`${DEFAULT_PREFIX}-tabs-disabled`);
    }

    return withDirectives(
      createVNode(
        ATabs,
        {
          animated: true,
          ...PropRecordHelper.collectionBasicProps(this.$attrs, classNames, style),
          ...(componentData || {}),
          ref: 'origin',
          id,
          activeKey,
          tabPosition,
          verticalHeight,
          destroyInactiveTabPane,
          type,
          'onUpdate:activeKey': this.onUpdateActiveKey
        },
        PropRecordHelper.collectionSlots(this.$slots, [
          {
            origin: 'default',
            isNotNull: true
          },
          {
            origin: 'tabBarLeftExtraContent',
            target: 'leftExtra'
          },
          {
            origin: 'tabBarExtraContent',
            target: 'rightExtra'
          }
        ])
      ),
      [[vShow, !invisible]]
    );
  }
});
</script>
