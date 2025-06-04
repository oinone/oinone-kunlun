<template>
  <div class="oio-debug">
    <oio-button type="link" @click="onClick">{{ $translate('调试') }}</oio-button>
  </div>
</template>
<script lang="ts">
import { OioButton } from '@oinone/kunlun-vue-ui-antd';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'Debug',
  components: {
    OioButton
  },
  inheritAttrs: false,
  props: {
    onClick: {
      type: Function as PropType<() => void>
    }
  }
});
</script>
<style lang="scss">
.oio-debug {
  display: flex;
  align-items: center;
}
</style>
