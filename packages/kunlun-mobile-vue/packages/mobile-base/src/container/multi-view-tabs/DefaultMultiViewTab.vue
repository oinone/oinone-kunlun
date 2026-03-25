<template>
  <van-tab :key="currentHandle" :name="currentHandle">
    <template #title>
      <div :class="`${DEFAULT_PREFIX}-tab-bar`">
        <span :class="`${DEFAULT_PREFIX}-tab-title`" :title="title">{{ title }}</span>
      </div>
    </template>
    <div :class="`${DEFAULT_PREFIX}-tab`">
      <div :class="[`${DEFAULT_PREFIX}-tab-content`, `${DEFAULT_PREFIX}-tab-${tabPosition}-content`]">
        <slot />
      </div>
    </div>
  </van-tab>
</template>
<script lang="ts">
import type { DslDefinition } from '@oinone/kunlun-dsl';
import {
  DEFAULT_PREFIX,
  DEFAULT_TAB_TITLE,
  OioTabProps,
  useInjectOioFormContext,
  useInjectOioTabsContext,
  useProviderOioFormContext
} from '@oinone/kunlun-vue-ui-mobile-vant';
import { Tab as VanTab } from 'vant';
import { computed, defineComponent, type PropType } from 'vue';

export default defineComponent({
  name: 'DefaultMultiViewTab',
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
    title: {
      type: String,
      default: DEFAULT_TAB_TITLE
    }
  },
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
      tabPosition: tabsContext.tabPosition,
      DEFAULT_PREFIX
    };
  }
});
</script>
