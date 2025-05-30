<template>
  <div :class="`${DEFAULT_PREFIX}-color-preview`">
    <div :class="`${DEFAULT_PREFIX}-color-preview-inner`" :style="{backgroundColor: value}"></div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  inheritAttrs: false,
  props: {
    value: String
  },
  setup() {
    return { DEFAULT_PREFIX };
  }
});
</script>
