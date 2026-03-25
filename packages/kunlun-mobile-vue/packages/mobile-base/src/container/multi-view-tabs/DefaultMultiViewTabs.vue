<template>
  <van-tabs
    :class="`${DEFAULT_PREFIX}-default-multi-view-tabs`"
    :tab-position="tabPosition"
    lazy-render
    swipeable
    :vertical-height="264"
  >
    <slot />
  </van-tabs>
</template>
<script lang="ts">
import {
  DEFAULT_PREFIX,
  FormLayout,
  OioTabPosition,
  useInjectOioFormContext,
  useProviderOioFormContext
} from '@oinone/kunlun-vue-ui-mobile-vant';
import { Tabs as VanTabs } from 'vant';
import { computed, defineComponent, type PropType } from 'vue';

export default defineComponent({
  name: 'DefaultMultiViewTabs',
  components: {
    VanTabs
  },
  props: {
    invisible: {
      type: Boolean,
      default: false
    },
    tabPosition: {
      type: String as PropType<OioTabPosition>,
      default: OioTabPosition.TOP
    },
    layout: {
      type: [String, Object] as PropType<FormLayout>
    }
  },
  setup(props) {
    const formContext = useInjectOioFormContext();

    const layout = computed(() => {
      return props.layout || formContext.layout.value;
    });

    useProviderOioFormContext({
      ...formContext,
      layout
    });

    return {
      DEFAULT_PREFIX
    };
  }
});
</script>
