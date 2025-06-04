<template>
  <div class="mobile-enum-tag-with-color" :style="style" v-if="!config.icon">{{ displayName }}</div>
  <div class="mobile-enum-tag-with-color" v-else-if="config.showText" :style="{ color: config.textColor }">
    <div class="mobile-tag-icon-wrapper" :style="style">
      <oio-icon :icon="config.icon" size="12px" :color="config.iconColor || config.textColor" />
    </div>
    {{ displayName }}
  </div>
  <div class="mobile-enum-tag-with-color mobile-tag-icon-wrapper" :style="style" v-else>
    <oio-icon :icon="config.icon" size="12px" :color="config.iconColor || config.textColor" />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { OioIcon } from '@oinone/kunlun-vue-ui-mobile-vant';

export default defineComponent({
  props: {
    displayName: {
      type: String,
      default: ''
    },
    justifyContent: {
      type: String
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
.mobile-enum-tag-with-color {
  border-radius: var(--oio-border-radius);
  font-size: var(--oio-font-size-sm);
  padding: var(--oio-padding-xxs);
  display: flex;
  align-items: center;
}
.mobile-tag-icon-wrapper {
  border-radius: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--oio-padding-xxs);
}
</style>
