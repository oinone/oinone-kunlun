<template>
  <div :class="`k-m-layout-content ${DEFAULT_PREFIX}-scrollbar`">
    <slot></slot>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '@oinone/kunlun-vue-ui-mobile-vant';

export default defineComponent({
  setup() {
    return { DEFAULT_PREFIX };
  }
});
</script>
