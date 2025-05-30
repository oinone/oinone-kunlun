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
import {
  DEFAULT_PREFIX,
  DEFAULT_TAB_TITLE,
  OioTabProps,
  useInjectOioFormContext,
  useInjectOioTabsContext,
  useProviderOioFormContext
} from '@kunlun/vue-ui-mobile-vant';
import { DslDefinition } from '@kunlun/dsl';
import { Tab as VanTab } from 'vant';
import { computed, defineComponent, PropType } from 'vue';

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
      DEFAULT_TAB_TITLE,
      tabPosition: tabsContext.tabPosition,
      DEFAULT_PREFIX
    };
  }
});
</script>
