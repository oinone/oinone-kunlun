<template>
  <div class="mobile-string-tag-with-color" :style="style" v-if="!config.icon">{{ currentValue }}</div>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { OioIcon } from '@oinone/kunlun-vue-ui-mobile-vant';

export default defineComponent({
  props: {
    currentValue: {
      type: String,
      default: ''
    },
    optConfig: {
      type: Object,
      default: undefined
    }
  },
  inheritAttrs: false,
  components: { OioIcon },
  setup(props) {
    const config = ref({});
    const style = computed(() => {
      const optConfig = props.optConfig || {
        bgColor: '',
        textColor: 'var(--oio-text-color)'
      };
      const styleStr = `background: ${optConfig.bgColor};
      color: ${optConfig.textColor};
      `;
      config.value = optConfig;
      return styleStr;
    });

    return {
      style,
      config
    };
  }
});
</script>
<style scoped lang="scss">
.mobile-string-tag-with-color {
  border-radius: var(--oio-border-radius);
  font-size: var(--oio-font-size-sm);
  padding: var(--oio-padding-xxs);
  display: flex;
  align-items: center;
}
</style>
